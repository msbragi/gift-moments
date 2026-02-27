import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { User } from '../../../common/decorators/user.decorator';
import { PaymentService, CreatePaymentRequest, PaymentResult } from '../services/payment.service';
import { PaymentTransaction } from '../entities/payment-transaction.entity';

class CreatePaymentDto {
    subscriptionPlanId: number;
    gatewayCode: 'stripe' | 'paypal';
    amountCents: number;
    currencyCode?: string;
}

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('process')
    @ApiOperation({ summary: 'Process a subscription payment' })
    @ApiResponse({ status: 200, description: 'Payment processed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid payment request' })
    async processPayment(
        @User('id') userId: number,
        @Body() createPaymentDto: CreatePaymentDto
    ): Promise<PaymentResult> {
        const request: CreatePaymentRequest = {
            userId,
            ...createPaymentDto
        };

        return this.paymentService.processSubscriptionPayment(request);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get user payment transactions' })
    @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
    async getUserTransactions(@User('id') userId: number): Promise<PaymentTransaction[]> {
        return this.paymentService.getUserTransactions(userId);
    }

    @Post('webhooks/:gateway')
    @ApiOperation({ summary: 'Handle payment gateway webhooks' })
    async handleWebhook(
        @Param('gateway') gateway: string,
        @Body() payload: any
    ): Promise<{ success: boolean }> {
        await this.paymentService.processWebhook(gateway, payload);
        return { success: true };
    }
}
