import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ISubscriptionPlan } from '../../../common/interfaces/models.interface';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity implements ISubscriptionPlan {
    @ApiProperty({ description: 'Unique plan identifier (e.g., free, premium)' })
    @Column({ unique: true, length: 50 })
    name: string;

    @ApiProperty({ description: 'Display name for the plan' })
    @Column({ name: 'display_name', length: 100 })
    displayName: string;

    @ApiProperty({ description: 'Plan description', nullable: true })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({ description: 'Monthly price in decimal format', default: 0.00 })
    @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    priceMonthly: number;

    @ApiProperty({ description: 'Yearly price in decimal format', default: 0.00 })
    @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    priceYearly: number;

    @ApiProperty({ description: 'Price in decimal format for one capsule buy', default: 0.00 })
    @Column({ name: 'price_onetime', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    priceOnetime: number;

    @ApiProperty({ description: 'Plan duration', default: 0 })
    @Column({ name: 'duration_months', default: 0 })
    durationMonths: number;

    @ApiProperty({ description: 'Limits configuration as JSON string' })
    @Column({ name: 'limits_config', type: 'text' })
    limitsConfig: string;

    @ApiProperty({ description: 'Features configuration as JSON string', nullable: true })
    @Column({ name: 'features_config', type: 'text', nullable: true })
    featuresConfig?: string;

    @ApiProperty({ description: 'Whether the plan is active and available', default: true })
    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Sort order for display', default: 0 })
    @Column({ name: 'sort_order', default: 0 })
    sortOrder: number;

//    @OneToMany(() => UserSubscription, userSubscription => userSubscription.subscriptionPlan)
//    userSubscriptions: UserSubscription[];
    
    // Helper methods for working with JSON configurations
    getLimits(): any {
        try {
            return JSON.parse(this.limitsConfig);
        } catch {
            return {};
        }
    }

    getFeatures(): any {
        try {
            return this.featuresConfig ? JSON.parse(this.featuresConfig) : {};
        } catch {
            return {};
        }
    }

    setLimits(limits: any): void {
        this.limitsConfig = JSON.stringify(limits);
    }

    setFeatures(features: any): void {
        this.featuresConfig = JSON.stringify(features);
    }

    // Business logic helpers
    isFree(): boolean {
        return this.name === 'free' || this.priceMonthly === 0;
    }

    getMonthlyDiscount(): number {
        if (this.priceYearly === 0 || this.priceMonthly === 0) return 0;
        const yearlyMonthly = this.priceYearly / 12;
        return Math.round(((this.priceMonthly - yearlyMonthly) / this.priceMonthly) * 100);
    }

    getLimit(limitName: string): number | null {
        const limits = this.getLimits();
        return limits[limitName] || null;
    }

    hasFeature(featureName: string): boolean {
        const features = this.getFeatures();
        return features[featureName] === true;
    }
}
