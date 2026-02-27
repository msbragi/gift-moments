import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService extends BaseService<SubscriptionPlan> {
    constructor(
        @InjectRepository(SubscriptionPlan)
        private subscriptionPlansRepository: Repository<SubscriptionPlan>
    ) {
        super(subscriptionPlansRepository);
    }

    /**
     * Subscription plans are public resources, so ownership check always returns true
     * Only admins can modify plans, but that's handled by admin guards, not ownership
     */
    async checkOwnership(id: number, userId: number): Promise<boolean> {
        // Subscription plans are public resources
        return true;
    }

    /**
     * Get all active subscription plans ordered by sort_order
     */
    async getActivePlans(): Promise<SubscriptionPlan[]> {
        return this.subscriptionPlansRepository.find({
            where: { isActive: true, deleted: null },
            order: { sortOrder: 'ASC' }
        });
    }

    /**
     * Get a plan by name (e.g., 'free', 'premium')
     */
    async findByName(name: string): Promise<SubscriptionPlan | null> {
        return this.subscriptionPlansRepository.findOne({
            where: { name, isActive: true, deleted: null }
        });
    }

    /**
     * Get the free plan
     */
    async getFreePlan(): Promise<SubscriptionPlan | null> {
        return this.findByName('free');
    }

    /**
     * Get all premium plans (non-free plans)
     */
    async getPremiumPlans(): Promise<SubscriptionPlan[]> {
        const plans = await this.getActivePlans();
        return plans.filter(plan => !plan.isFree());
    }

    /**
     * Get plans with their parsed limits and features
     */
    async getPlansWithConfig(): Promise<any[]> {
        const plans = await this.getActivePlans();
        return plans.map(plan => ({
            ...plan,
            limits: plan.getLimits(),
            features: plan.getFeatures(),
            monthlyDiscount: plan.getMonthlyDiscount()
        }));
    }
}
