import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IPaymentGateway } from 'src/common/interfaces/models.interface';

@Entity('payment_gateways')
export class PaymentGateway implements IPaymentGateway {
    @ApiProperty({ description: 'Gateway ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created' })
    created: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated' })
    updated: Date;

    @ApiProperty({ description: 'Gateway code (stripe, paypal)' })
    @Column({ name: 'gateway_code', unique: true, length: 20 })
    gatewayCode: string;

    @ApiProperty({ description: 'Display name' })
    @Column({ name: 'gateway_name', length: 50 })
    gatewayName: string;

    @ApiProperty({ description: 'Whether gateway is active' })
    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Public API key' })
    @Column({ name: 'api_key_public', nullable: true })
    apiKeyPublic?: string;

    @ApiProperty({ description: 'Secret API key (encrypted)' })
    @Column({ name: 'api_key_secret', nullable: true })
    apiKeySecret?: string;

    @ApiProperty({ description: 'Webhook secret' })
    @Column({ name: 'webhook_secret', nullable: true })
    webhookSecret?: string;

    @ApiProperty({ description: 'Webhook URL' })
    @Column({ name: 'webhook_url', nullable: true })
    webhookUrl?: string;

    @ApiProperty({ description: 'Gateway logo' })
    @Column({ name: 'logo', nullable: true })
    logo?: string;
}
