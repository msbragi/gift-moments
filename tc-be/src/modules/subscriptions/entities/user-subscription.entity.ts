import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Capsule } from 'src/modules/capsules/entities/capsule.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IUserSubscription } from '../../../common/interfaces/models.interface';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PaymentTransaction } from 'src/modules/payments/entities/payment-transaction.entity';

@Entity('user_subscriptions')
export class UserSubscription extends BaseEntity implements IUserSubscription {
    @ApiProperty()
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ApiProperty()
    @Column({ name: 'plan_id', type: 'int' })
    planId: number;

    @ApiProperty()
    @Column({ name: 'capsule_id', type: 'int' })
    capsuleId: number;

    @ApiProperty({ enum: ['active', 'expired', 'cancelled'], default: 'active' })
    @Column({ type: 'varchar', length: 20, default: 'active' })
    status: 'active' | 'expired' | 'cancelled';

    @ApiProperty()
    @Column({ name: 'starts_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startsAt: Date;

    @ApiProperty({ required: false })
    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt?: Date | null;

    @ApiProperty({ required: false })
    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelledAt?: Date | null;

    @ApiProperty({ required: false, description: 'Generic transaction/subscription id from payment provider' })
    @Column({ name: 'transaction_id', type: 'int' })
    transactionId?: number | null;

    @ApiProperty({ required: false, description: 'Generic customer id from payment provider' })
    @Column({ name: 'transaction_customer_id', type: 'varchar', length: 255, nullable: true })
    transactionCustomerId?: string | null;

    @ApiProperty({ default: 'free' })
    @Column({ name: 'payment_method', type: 'varchar', length: 20, default: 'free' })
    paymentMethod: string;

    @ApiProperty({ default: 'monthly' })
    @Column({ name: 'billing_cycle', type: 'varchar', length: 20, default: 'monthly' })
    billingCycle: string;

    @ApiProperty({ default: 0.00 })
    @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    amountPaid: number;

    @ApiProperty({ default: 'USD' })
    @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
    currency: string;

    @ManyToOne(() => SubscriptionPlan, { eager: false })
    @JoinColumn({ name: 'plan_id' }) // This explicitly sets the join column
    subscriptionPlan?: SubscriptionPlan;

    @ManyToOne(() => Capsule, { eager: false })
    @JoinColumn({ name: 'capsule_id' }) // This explicitly sets the join column
    capsule?: Capsule;

    // Optional: Add relation to payment transaction
    @ManyToOne(() => PaymentTransaction, { eager: false })
    @JoinColumn({ name: 'transaction_id' })
    paymentTransaction?: PaymentTransaction;    

}