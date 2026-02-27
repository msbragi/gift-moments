import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaidSubscriptionDto {
    @ApiProperty({ example: 'standard', description: 'The name of the subscription plan' })
    @IsString()
    planName: string;

    @ApiProperty({ example: 'paypal', description: 'The payment gateway code (e.g., paypal, stripe)' })
    @IsString()
    gwCode: string;
}