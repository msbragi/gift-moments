import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription-plan.entity';
import { IPaymentTransaction, PaymentStatus } from 'src/common/interfaces/models.interface';

@Entity('payment_transactions')
export class PaymentTransaction implements IPaymentTransaction{
    @ApiProperty({ description: 'Transaction ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created' })
    created: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated' })
    updated: Date;
    
    @ApiProperty({ description: 'User ID' })
    @Column({ name: 'user_id' })
    userId: number;

    @ApiProperty({ description: 'Subscription plan ID' })
    @Column({ name: 'subscription_plan_id' })
    subscriptionPlanId: number;

    @ApiProperty({ description: 'Gateway code (stripe, paypal)' })
    @Column({ name: 'gateway_code', length: 20 })
    gatewayCode: string;

    @ApiProperty({ description: 'External transaction ID from gateway' })
    @Column({ name: 'gateway_transaction_id', nullable: true })
    gatewayTransactionId?: string;

    @ApiProperty({ description: 'Amount in cents' })
    @Column({ name: 'amount_cents' })
    amountCents: number;

    @ApiProperty({ description: 'Currency code' })
    @Column({ name: 'currency_code', length: 3, default: 'USD' })
    currencyCode: string;

    @ApiProperty({ description: 'Transaction status', enum: PaymentStatus })
    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @ApiProperty({ description: 'Failure reason if failed' })
    @Column({ name: 'failure_reason', type: 'text', nullable: true })
    failureReason?: string;

    @ApiProperty({ description: 'Gateway response for debugging' })
    @Column({ name: 'gateway_response', type: 'text', nullable: true })
    gatewayResponse?: string;

    @ApiProperty({ description: 'When payment was processed' })
    @Column({ name: 'processed_at', nullable: true })
    processedAt?: Date;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => SubscriptionPlan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subscription_plan_id' })
    subscriptionPlan: SubscriptionPlan;
}
