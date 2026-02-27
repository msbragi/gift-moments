import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ICapsule, PaymentStatus } from 'src/common/interfaces/models.interface';
import { SQLiteService } from 'src/common/services/sqlite/sqlite.service';
import { PaymentTransaction } from 'src/modules/payments/entities/payment-transaction.entity';
import { PaymentService, PaymentGatewayCode } from 'src/modules/payments/services/payment.service';
import { DataSource } from 'typeorm';
import { CapsulesService } from '../../capsules/services/capsules.service';
import { ISubscriptionUsageData } from '../interfaces/subscription-metrics.interface';
import { SubscriptionDataHelper } from '../utils/subscription-data.helper';
import { SubscriptionHistoryService } from './subscription-history.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { UserSubscriptionService } from './user-subscription.service';

@Injectable()
export class SubscriptionsService {
    private readonly logger = new Logger(SubscriptionsService.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly capsulesService: CapsulesService,
        private readonly subscriptionPlansService: SubscriptionPlansService,
        private readonly userSubscriptionsService: UserSubscriptionService,
        private readonly subscriptionHistoryService: SubscriptionHistoryService,
        private sqliteService: SQLiteService,
        private readonly dataSource: DataSource
    ) { }

    /**
     * Handle payment transaction status change events
     * Triggered by PaymentService when transaction status changes
     */
    @OnEvent('payment.transaction.changed')
    async handlePaymentTransactionChange(transactionId: number): Promise<void> {
        this.logger.log(`Processing transaction status change for transaction ${transactionId}`);

        try {
            // Get fresh transaction data
            const transaction = await this.paymentService.getTransactionById(transactionId);
            if (!transaction) {
                this.logger.error(`Transaction ${transactionId} not found`);
                return;
            }

            if (transaction.status === PaymentStatus.COMPLETED) {
                await this.handleSubscription(transaction);
            } else if (transaction.status === PaymentStatus.FAILED) {
                this.logger.warn(`Transaction ${transactionId} failed - no action required`);
            }
        } catch (error) {
            this.logger.error(`Error handling transaction ${transactionId} status change:`, error);
        }
    }

    /**
     * Handle payment transaction request from controller
     * Creates payment transaction and returns immediately
     */
    async handlePaymentTransaction(userId: number, planName: string, gwCode: string): Promise<any> {
        const plan = await this.subscriptionPlansService.findByName(planName);
        if (!plan) {
            throw new Error(`Plan ${planName} not found`);
        }

        if (planName === 'free') {
            const hasFree = await this.userSubscriptionsService.hasFreeSubscription(userId, 'free');
            if (hasFree) {
                throw new Error('User already has a free subscription');
            }
        }

        const paymentRequest = SubscriptionDataHelper.createPaymentRequest(
            userId, 
            plan.id, 
            gwCode, 
            plan.priceOnetime
        );

        const paymentResult = await this.paymentService.processSubscriptionPayment(paymentRequest);
        if (!paymentResult || !paymentResult.transactionId) {
            throw new Error(`Failed to create payment transaction for plan ${planName}`);
        }

        const transaction = await this.paymentService.getTransactionById(paymentResult.transactionId);
        return {
            transaction: transaction,
            capsule: null, // Subscription will be created via event when payment completes
        };
    }

    /**
     * Private method to handle actual subscription creation
     * Called when payment is completed
     */
    private async handleSubscription(transaction: PaymentTransaction): Promise<void> {
        // Check if subscription already exists
        const existingSubscription = await this.userSubscriptionsService.findByTransactionId(transaction.id);
        if (existingSubscription) {
            this.logger.log(`Subscription already exists for transaction ${transaction.id}`);
            return;
        }

        // Create subscription and capsule
        const capsule = await this.createUserSubscription(transaction);
        this.logger.log(`Subscription completed for transaction ${transaction.id}, capsule ${capsule.id} created`);
    }

    /**
     * Handle free subscription creation
     */
    async createFreeSubscription(userId: number): Promise<any> {
        return await this.handlePaymentTransaction(userId, 'free', PaymentGatewayCode.FREE);
    }

    /**
     * Create user subscription and capsule (existing method - unchanged)
     */
    async createUserSubscription(transaction: PaymentTransaction): Promise<ICapsule> {
        const plan = transaction.subscriptionPlan;
        if (!plan) {
            throw new Error(`Plan not found in transaction ${transaction.id}`);
        }
        const userId = transaction.userId;
        if (!userId) {
            throw new Error(`User id not found in transaction ${transaction.id}`);
        }

        // Start a transaction
        return await this.dataSource.transaction(async manager => {
            try {
                // Create the capsule with snapshotted plan data
                const capsuleData = SubscriptionDataHelper.createCapsuleData(userId, plan);
                const capsule = await this.capsulesService.create(capsuleData);

                // Create user subscription record
                const subscriptionData = SubscriptionDataHelper.createUserSubscriptionData(capsule, transaction);
                const userSubscription = await this.userSubscriptionsService.create(subscriptionData);

                // Create subscription history audit record
                const historyData = SubscriptionDataHelper.createSubscriptionHistoryData(capsule, transaction, userSubscription.id);
                const historyAudit = await this.subscriptionHistoryService.create(historyData);

                return capsule;
            } catch (error) {
                console.error('Error creating capsule for user:', error);
                throw error; // Rollback transaction on error
            }
        });
    }

    // ...existing methods (getUserUsageStatus, validateAddLibraryItem, etc.) remain unchanged...

    /**
     * Get user subscription usage status with limits and current usage for all subscriptions
     * Simple and clean with the new subscription-centric architecture
     */
    async getUserUsageStatus(userId: number): Promise<ISubscriptionUsageData[]> {
        try {
            const userSubscriptions = await this.userSubscriptionsService.findAll({
                where: { userId },
                relations: [
                    'subscriptionPlan',
                    'capsule',
                    'capsule.items',
                    'capsule.recipients'
                ]
            });

            if (!userSubscriptions || userSubscriptions.length === 0) {
                return [];
            }
            const totalStorageUsedBytes = await this.sqliteService.getUsageByUser(userId);

            return SubscriptionDataHelper.calculateUsage(userSubscriptions, totalStorageUsedBytes);
        } catch (error) {
            console.error('Error getting user usage status:', error);
            throw error;
        }
    }

    async validateAddLibraryItem(userId: number, size: number): Promise<boolean> {
        const userSubscriptions = await this.userSubscriptionsService.findAll({
            where: { userId },
            relations: ['subscriptionPlan']
        });
        const totalStorageUsedBytes = await this.sqliteService.getUsageByUser(userId);
        return SubscriptionDataHelper.validateStorageLimit(userSubscriptions, totalStorageUsedBytes, size);
    }

    async validateAddItem(userId: number, capsuleId: number, size: number): Promise<boolean> {
        const userSubscriptions = await this.userSubscriptionsService.findAll({
            where: { userId, capsuleId },
            relations: [
                'subscriptionPlan',
                'capsule',
                'capsule.items',
                'capsule.recipients'
            ]
        });
        return SubscriptionDataHelper.validateAddItem(userSubscriptions, size || 0);
    }

    async validateAddRecipient(userId: number, capsuleId: number): Promise<boolean> {
        const userSubscriptions = await this.userSubscriptionsService.findAll({
            where: { userId, capsuleId },
            relations: [
                'subscriptionPlan',
                'capsule',
                'capsule.recipients'
            ]
        });
        return SubscriptionDataHelper.validateAddRecipient(userSubscriptions);
    }

    async getPaymentGateways(): Promise<any[]> {
        return await this.paymentService.getPaymentGateways();
    }
}