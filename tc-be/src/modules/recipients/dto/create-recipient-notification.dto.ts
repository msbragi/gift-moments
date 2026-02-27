import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { IRecipientNotification } from '../../../common/interfaces/models.interface';

export class CreateRecipientNotificationDto implements Pick<
    IRecipientNotification,
    'recipientId' | 'capsuleId' | 'type' | 'status' | 'sentAt' | 'scheduledFor' | 'errorMessage'
> {
    @ApiProperty()
    @IsInt()
    recipientId: number;

    @ApiProperty()
    @IsInt()
    capsuleId: number;

    @ApiProperty({ enum: ['initial', 'reminder', 'custom'] })
    @IsEnum(['initial', 'reminder', 'custom'])
    type: 'initial' | 'reminder' | 'custom';

    @ApiProperty({ enum: ['sent', 'failed', 'pending'], default: 'sent' })
    @IsEnum(['sent', 'failed', 'pending'])
    status: 'sent' | 'failed' | 'pending';

    @ApiProperty()
    @IsDate()
    sentAt: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    scheduledFor?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    errorMessage?: string;
}