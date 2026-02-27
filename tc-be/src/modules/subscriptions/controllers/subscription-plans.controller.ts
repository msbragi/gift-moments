import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { LoggedGuard } from 'src/common/guards/logged.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SubscriptionPlansService } from '../services/subscription-plans.service';
import { UserSubscriptionService } from '../services/user-subscription.service';

@ApiTags('subscription-plans')
@Controller('api/v1/subscription-plans')
export class SubscriptionPlansController {
    constructor(
        private readonly subscriptionPlansService: SubscriptionPlansService,
        private readonly userSubscriptionService: UserSubscriptionService,
    ) { }

    @Get()
    @Public()
    @UseGuards(LoggedGuard) // added to retrieve if user is logged in
    @ApiOperation({ summary: 'Get all available subscription plans' })
    @ApiResponse({ status: 200, type: [SubscriptionPlan] })
    async getPlans(@User('userId') userId: number) {
        let plans = await this.subscriptionPlansService.getPlansWithConfig();
        if (userId) {
            const hasFreePlan = await this.userSubscriptionService.hasFreeSubscription(userId);
            if (hasFreePlan) {
                plans = plans.filter(plan => plan.name !== 'free');
            }
        }
        return  plans;
    }

    @Get('active')
    @Public()
    @ApiOperation({ summary: 'Get all active subscription plans' })
    @ApiResponse({ status: 200, type: [SubscriptionPlan] })
    async getActivePlans(@User('userId') userId: number) {
        return this.subscriptionPlansService.getActivePlans();
    }

    @Get('premium')
    @Public()
    @ApiOperation({ summary: 'Get all premium subscription plans' })
    @ApiResponse({ status: 200, type: [SubscriptionPlan] })
    async getPremiumPlans() {
        return this.subscriptionPlansService.getPremiumPlans();
    }
}
