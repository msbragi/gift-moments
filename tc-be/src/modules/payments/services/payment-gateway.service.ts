import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGateway } from '../entities/payment-gateway.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { IPaymentGateway, PaymentStatus } from 'src/common/interfaces/models.interface';

@Injectable()
export class PaymentGatewayService {
    private readonly logger = new Logger(PaymentGatewayService.name);

    constructor(
        @InjectRepository(PaymentGateway)
        private readonly paymentGatewayRepo: Repository<PaymentGateway>,
        
        @InjectRepository(PaymentTransaction)
        private readonly paymentTransactionRepo: Repository<PaymentTransaction>
    ) {}

    /**
     * Get all payment gateways
     */
    async getAllGateways(): Promise<PaymentGateway[]> {
        return this.paymentGatewayRepo.find({
            order: { created: 'DESC' }
        });
    }

    /**
     * Get payment gateway by ID
     */
    async getGatewayById(id: number): Promise<PaymentGateway> {
        const gateway = await this.paymentGatewayRepo.findOne({ where: { id } });
        if (!gateway) {
            throw new NotFoundException(`Payment gateway with ID ${id} not found`);
        }
        return gateway;
    }

    /**
     * Create new payment gateway
     */
    async createGateway(gatewayData: Partial<IPaymentGateway>): Promise<PaymentGateway> {
        // Validate required fields
        if (!gatewayData.gatewayName || !gatewayData.gatewayCode) {
            throw new BadRequestException('Gateway name and gateway code are required');
        }

        // Check if gateway code already exists
        const existingGateway = await this.paymentGatewayRepo.findOne({
            where: { gatewayCode: gatewayData.gatewayCode }
        });
        if (existingGateway) {
            throw new BadRequestException(`Gateway with code '${gatewayData.gatewayCode}' already exists`);
        }

        const gateway = this.paymentGatewayRepo.create({
            ...gatewayData,
            isActive: gatewayData.isActive ?? true
        });
        
        this.logger.log(`Creating new payment gateway: ${gatewayData.gatewayCode}`);
        return this.paymentGatewayRepo.save(gateway);
    }

    /**
     * Update payment gateway
     */
    async updateGateway(id: number, updateData: Partial<IPaymentGateway>): Promise<PaymentGateway> {
        const gateway = await this.getGatewayById(id);
        
        // If updating gateway code, check for conflicts
        if (updateData.gatewayCode && updateData.gatewayCode !== gateway.gatewayCode) {
            const existingGateway = await this.paymentGatewayRepo.findOne({
                where: { gatewayCode: updateData.gatewayCode }
            });
            if (existingGateway) {
                throw new BadRequestException(`Gateway with code '${updateData.gatewayCode}' already exists`);
            }
        }

        // Update fields
        Object.assign(gateway, updateData);
        
        this.logger.log(`Updating payment gateway ${id}: ${gateway.gatewayCode}`);
        return this.paymentGatewayRepo.save(gateway);
    }

    /**
     * Delete payment gateway
     */
    async deleteGateway(id: number): Promise<void> {
        const gateway = await this.getGatewayById(id);
        
        // Check if gateway has associated transactions
        const transactionCount = await this.paymentTransactionRepo.count({
            where: { gatewayCode: gateway.gatewayCode }
        });
        
        if (transactionCount > 0) {
            throw new BadRequestException(
                `Cannot delete gateway with ${transactionCount} associated transactions. ` +
                'Disable the gateway instead.'
            );
        }

        this.logger.log(`Deleting payment gateway ${id}: ${gateway.gatewayCode}`);
        await this.paymentGatewayRepo.remove(gateway);
    }

    /**
     * Toggle gateway active status
     */
    async toggleGatewayStatus(id: number): Promise<PaymentGateway> {
        const gateway = await this.getGatewayById(id);
        gateway.isActive = !gateway.isActive;
        
        this.logger.log(`Toggling gateway ${id} status to: ${gateway.isActive ? 'active' : 'inactive'}`);
        return this.paymentGatewayRepo.save(gateway);
    }

    /**
     * Get gateway statistics (for admin dashboard)
     */
    async getGatewayStats(id: number): Promise<{
        totalTransactions: number;
        completedTransactions: number;
        failedTransactions: number;
        totalRevenueCents: number;
    }> {
        const gateway = await this.getGatewayById(id);
        
        const [totalTransactions, completedTransactions, failedTransactions, revenueResult] = await Promise.all([
            this.paymentTransactionRepo.count({ where: { gatewayCode: gateway.gatewayCode } }),
            this.paymentTransactionRepo.count({ where: { gatewayCode: gateway.gatewayCode, status: PaymentStatus.COMPLETED } }),
            this.paymentTransactionRepo.count({ where: { gatewayCode: gateway.gatewayCode, status: PaymentStatus.FAILED } }),
            this.paymentTransactionRepo
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amountCents)', 'total')
                .where('transaction.gatewayCode = :gatewayCode', { gatewayCode: gateway.gatewayCode })
                .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
                .getRawOne()
        ]);

        return {
            totalTransactions,
            completedTransactions,
            failedTransactions,
            totalRevenueCents: parseInt(revenueResult?.total || '0', 10)
        };
    }
}
