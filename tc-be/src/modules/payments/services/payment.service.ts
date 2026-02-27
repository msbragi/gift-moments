import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentStatus } from 'src/common/interfaces/models.interface';
import { Not, Repository } from 'typeorm';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription-plan.entity';
import { PaymentGateway } from '../entities/payment-gateway.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { FreeGatewayProvider } from '../providers/free-gateway.provider';
import { PaymentGatewayProvider, WebhookResult } from '../providers/payment-gateway.provider';
import { PaypalGatewayProvider } from '../providers/paypal-gateway.provider';
import { StripeGatewayProvider } from '../providers/stripe-gateway.provider';

export enum PaymentGatewayCode {
    'FREE' = 'FREE',
    'stripe' = 'stripe',
    'paypal' = 'paypal'
}

export interface CreatePaymentRequest {
    userId: number;
    subscriptionPlanId: number;
    gatewayCode: 'FREE' | 'stripe' | 'paypal';
    amountCents: number;
    currencyCode?: string;
}

export interface PaymentResult {
    transactionId: number;
    gatewayTransactionId?: string;
    status: PaymentStatus;
    redirectUrl?: string; // For PayPal redirects
    clientSecret?: string; // For Stripe Payment Intents
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @InjectRepository(PaymentTransaction)
        private readonly paymentTransactionRepo: Repository<PaymentTransaction>,
        @InjectRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepo: Repository<SubscriptionPlan>,
        @InjectRepository(PaymentGateway)
        private readonly paymentGatewayRepo: Repository<PaymentGateway>,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /**
     * Get provider instance for gateway
     */
    private async getProvider(gatewayCode: string): Promise<PaymentGatewayProvider> {
        const gateway = await this.paymentGatewayRepo.findOne({
            where: { gatewayCode, isActive: true }
        });
        
        if (!gateway) {
            throw new NotFoundException(`Gateway ${gatewayCode} not configured`);
        }

        switch (gatewayCode) {
            case 'FREE':
                return new FreeGatewayProvider(gateway);
            case 'stripe':
                return new StripeGatewayProvider(gateway);
            case 'paypal':
                return new PaypalGatewayProvider(gateway);
            default:
                throw new BadRequestException(`Unsupported gateway: ${gatewayCode}`);
        }
    }

    /**
     * Process subscription payment - Refactored pattern
     */
    async processSubscriptionPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
        this.logger.log(`Processing payment for user ${request.userId}, plan ${request.subscriptionPlanId}, gateway ${request.gatewayCode}`);

        // 1. Validate subscription plan
        const plan = await this.subscriptionPlanRepo.findOne({
            where: { id: request.subscriptionPlanId }
        });
        if (!plan) {
            throw new NotFoundException(`Subscription plan ${request.subscriptionPlanId} not found`);
        }

        // 2. Scrive transazione PENDING
        const transaction = await this.createTransaction(request);

        try {
            // 3. Inizializza provider
            const provider = await this.getProvider(request.gatewayCode);

            // 4. Provider.processPayment()
            const providerResult = await provider.processPayment({
                transaction,
                gateway: (provider as any).config,
                plan
            });

            // 5. Aggiorna transazione
            await this.updateTransaction(transaction.id, {
                status: providerResult.status,
                gatewayTransactionId: providerResult.gatewayTransactionId,
                processedAt: new Date()
            });

            // 6. Emit event (solo transactionId)
            this.eventEmitter.emit('payment.transaction.changed', transaction.id);

            return {
                ...providerResult,
                transactionId: transaction.id,
            };

        } catch (error) {
            this.logger.error(`Payment failed for transaction ${transaction.id}:`, error);

            // Aggiorna come failed
            await this.updateTransaction(transaction.id, {
                status: PaymentStatus.FAILED,
                failureReason: error.message,
                processedAt: new Date()
            });

            // Emit event failed
            this.eventEmitter.emit('payment.transaction.changed', transaction.id);

            throw error;
        }
    }

    /**
     * Process webhook - New pattern
     */
    async processWebhook(gatewayCode: string, payload: any): Promise<void> {
        this.logger.log(`Processing webhook from ${gatewayCode}`);

        try {
            // 1. Inizializza provider
            const provider = await this.getProvider(gatewayCode);

            // 2. Provider.handleWebhook()
            const result: WebhookResult = await provider.handleWebhook(payload);

            if (!result.isValid) {
                throw new BadRequestException(`Invalid ${gatewayCode} webhook: ${result?.failureReason || 'Generic error'}`);
            }

            // Se non ci sono dati di transazione, ignora
            if (!result.gatewayTransactionId || !result.status) {
                this.logger.log(`Webhook ${gatewayCode} ignored - no transaction data`);
                return;
            }

            // 3. Trova transaction
            const transaction = await this.findByGatewayTransactionId(result.gatewayTransactionId);
            if (!transaction) {
                throw new NotFoundException(`Transaction not found: ${result.gatewayTransactionId}`);
            }

            // 4. Aggiorna transazione
            await this.updateTransaction(transaction.id, {
                status: result.status,
                gatewayResponse: result.gatewayResponse,
                failureReason: result.failureReason,
                processedAt: new Date()
            });

            // 5. Emit event (solo transactionId)
            this.eventEmitter.emit('payment.transaction.changed', transaction.id);

        } catch (error) {
            this.logger.error(`Webhook processing failed for ${gatewayCode}:`, error);
            throw error;
        }
    }

    /**
     * Find transaction by gateway transaction ID
     */
    async findByGatewayTransactionId(gatewayTransactionId: string): Promise<PaymentTransaction> {
        return this.paymentTransactionRepo.findOne({
            where: { gatewayTransactionId },
            relations: ['subscriptionPlan']
        });
    }

    /**
     * Get user payment transaction by id
     */
    async getTransactionById(id: number): Promise<PaymentTransaction> {
        return this.paymentTransactionRepo.findOne({
            where: { id },
            relations: ['subscriptionPlan']
        });
    }

    /**
     * Get all user's payment transactions
     */
    async getUserTransactions(userId: number): Promise<PaymentTransaction[]> {
        return this.paymentTransactionRepo.find({
            where: { userId },
            relations: ['subscriptionPlan'],
            order: { created: 'DESC' }
        });
    }

    /**
     * Get payment gateways for frontend
     */
    async getPaymentGateways() {
        const gateways = await this.paymentGatewayRepo.find({
            where: {
                isActive: true,
                gatewayCode: Not('FREE')
            }
        });

        return gateways.map(gateway => ({
            id: gateway.id,
            code: gateway.gatewayCode,
            name: gateway.gatewayName,
            displayName: gateway.gatewayName,
            logo: gateway.logo || null
        }));
    }

    /**
     * Create payment transaction record
     */
    private async createTransaction(request: CreatePaymentRequest): Promise<PaymentTransaction> {
        const transaction = this.paymentTransactionRepo.create({
            userId: request.userId,
            subscriptionPlanId: request.subscriptionPlanId,
            gatewayCode: request.gatewayCode,
            amountCents: request.amountCents,
            currencyCode: request.currencyCode || 'USD',
            status: PaymentStatus.PENDING
        });
        return this.paymentTransactionRepo.save(transaction);
    }

    /**
     * Update transaction
     */
    private async updateTransaction(id: number, updates: Partial<PaymentTransaction>): Promise<void> {
        await this.paymentTransactionRepo.update(id, updates);
    }
}