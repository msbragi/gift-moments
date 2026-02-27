import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ISubscriptionHistory, SubscriptionHistoryAction } from '../../../common/interfaces/models.interface';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity('subscription_history')
export class SubscriptionHistory implements ISubscriptionHistory {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'User ID associated with this history entry' })
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ApiProperty({ description: 'Subscription ID (plan purchase or assignment)' })
    @Column({ name: 'subscription_id', type: 'int' })
    subscriptionId: number;

    @ApiProperty({ description: 'Capsule ID if this action is related to a specific capsule', nullable: true })
    @Column({ name: 'capsule_id', type: 'int', nullable: true })
    capsuleId?: number | null;

    @ApiProperty({ description: 'Action performed (purchase, upgrade, expire, etc.)' })
    @Column({ length: 20 })
    action: SubscriptionHistoryAction;

    @ApiProperty({ description: 'Previous plan ID (if applicable)', nullable: true })
    @Column({ name: 'from_plan_id', type: 'int', nullable: true })
    fromPlanId?: number | null;

    @ApiProperty({ description: 'New plan ID (if applicable)', nullable: true })
    @Column({ name: 'to_plan_id', type: 'int', nullable: true })
    toPlanId?: number | null;

    @ApiProperty({ description: 'Reason or notes for this action', nullable: true })
    @Column({ type: 'text', nullable: true })
    reason?: string;

    @ApiProperty({ description: 'Amount paid for this action', default: 0.00 })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    amount: number;

    @ApiProperty()
    @CreateDateColumn()
    created: Date;

    // --- Virtual fields for BaseEntity compatibility and BaseService patterns ---
    get updated(): Date | null {
        return null;
    }
    set updated(_: Date | null) {
        // do nothing
    }

    get deleted(): Date | null {
        return null;
    }
    set deleted(_: Date | null) {
        // do nothing
    }

    // Optionally, you can add relations if you want to eager load plans
    @ManyToOne(() => SubscriptionPlan, { nullable: true })
    @JoinColumn({ name: 'from_plan_id' })
    fromPlan?: SubscriptionPlan;

    @ManyToOne(() => SubscriptionPlan, { nullable: true })
    @JoinColumn({ name: 'to_plan_id' })
    toPlan?: SubscriptionPlan;
}