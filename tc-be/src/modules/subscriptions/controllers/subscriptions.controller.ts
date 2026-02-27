import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ISubscriptionUsageData } from '../interfaces/subscription-metrics.interface';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreatePaidSubscriptionDto } from '../dto/create-paid-subscription.dto';

@ApiTags('subscriptions')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) { }

    @Get('usage')
    @ApiOperation({ summary: 'Get current user subscription usage and limits for all capsules' })
    @ApiResponse({
        status: 200,
        description: 'User subscription usage data for all capsules',
    })
    async getUserUsage(@User('userId') userId: number): Promise<ISubscriptionUsageData[]> {
        return this.subscriptionsService.getUserUsageStatus(userId);
    }

    /**
     * Validate if user can perform a specific action based on their subscription limits
     * This is a utility endpoint for frontend validation before attempting operations
     */
    @Get('validate/:action')
    @ApiOperation({ summary: 'Validate if user can perform a specific action based on subscription limits' })
    @ApiParam({ name: 'action', enum: ['create-capsule', 'add-item', 'add-recipient', 'upload-storage'] })
    @ApiResponse({
        status: 200,
        description: 'Validation result',
        schema: {
            properties: {
                isValid: { type: 'boolean' },
                message: { type: 'string' },
                currentValue: { type: 'number' },
                maxValue: { type: 'number' }
            }
        }
    })
    async validateUserAction(
        @Param('action') action: string,
        @User('userId') userId: number
    ) {
        // This shows how the validation service can be used in controllers
        // to enforce subscription limits before performing operations

        // For now, return a placeholder response
        // In the future, this could be fully implemented with the validation service
        return {
            isValid: true,
            message: 'Validation service available but not yet integrated with controllers'
        };
    }

    @Get('free')
    @ApiOperation({ summary: 'Create free user subscription' })
    @ApiResponse({
        status: 200,
        description: 'Return subscription transaction data',
    })
    async getFreeSubscription(@User('userId') userId: number): Promise<any> {
        return this.subscriptionsService.createFreeSubscription(userId);
    }

    @Post('pay')
    @ApiOperation({ summary: 'Create a paid subscription (one-time payment)' })
    @ApiResponse({
        status: 200,
        description: 'Returns payment transaction and capsule info (if completed)',
    })
    async createPaidSubscription(
        @User('userId') userId: number,
        @Body() body: CreatePaidSubscriptionDto
    ): Promise<any> {
        const { planName, gwCode } = body;
        if (!planName || !gwCode) {
            throw new BadRequestException('planName and gwCode are required');
        }
        return this.subscriptionsService.handlePaymentTransaction(userId, planName, gwCode);
    }

    @Get('payment-gateways')
    @ApiOperation({ summary: 'Get available payment gateways' })
    @ApiResponse({
        status: 200,
        description: 'Returns list of available payment gateways (excluding FREE)',
        schema: {
            example: [
                {
                    code: 'paypal',
                    name: 'PayPal Payment Gateway',
                    displayName: 'PayPal Payment Gateway',
                    logo: 'https://example.com/paypal-logo.png'
                },
                {
                    code: 'stripe',
                    name: 'Stripe Payment Gateway',
                    displayName: 'Stripe Payment Gateway',
                    logo: 'https://example.com/stripe-logo.png'
                }
            ]
        }
    })
    async getAvailableGateways(): Promise<any[]> {
        return this.subscriptionsService.getPaymentGateways();
    }

}
