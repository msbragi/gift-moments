import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ description: 'Notification title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Notification message' })
    @IsString()
    message: string;

    @ApiProperty({ description: 'Notification type', example: 'version-update' })
    @IsString()
    type: string;

    @ApiProperty({
        description: 'Notification category',
        enum: ['application', 'user-centric', 'discovery'],
        default: 'user-centric'
    })
    @IsEnum(['application', 'user-centric', 'discovery'])
    category: 'application' | 'user-centric' | 'discovery';

    @ApiProperty({ description: 'Is global notification', default: false })
    @IsBoolean()
    isGlobal: boolean;

    @ApiProperty({
        description: 'Notification priority',
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    })
    @IsEnum(['low', 'medium', 'high'])
    priority: 'low' | 'medium' | 'high';

    @ApiPropertyOptional({ description: 'Action URL' })
    @IsString()
    @IsOptional()
    actionUrl?: string;

    @ApiPropertyOptional({ description: 'Metadata as JSON string' })
    @IsString()
    @IsOptional()
    metadata?: string;

    @ApiPropertyOptional({ description: 'Expiration date' })
    @IsDateString()
    @IsOptional()
    expires?: Date;
}

export class UpdateNotificationDto {
    @ApiPropertyOptional({ description: 'Notification title' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ description: 'Notification message' })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiPropertyOptional({ description: 'Notification type' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiPropertyOptional({
        description: 'Notification category',
        enum: ['application', 'user-centric', 'discovery']
    })
    @IsEnum(['application', 'user-centric', 'discovery'])
    @IsOptional()
    category?: 'application' | 'user-centric' | 'discovery';

    @ApiPropertyOptional({ description: 'Is global notification' })
    @IsBoolean()
    @IsOptional()
    isGlobal?: boolean;

    @ApiPropertyOptional({
        description: 'Notification priority',
        enum: ['low', 'medium', 'high']
    })
    @IsEnum(['low', 'medium', 'high'])
    @IsOptional()
    priority?: 'low' | 'medium' | 'high';

    @ApiPropertyOptional({ description: 'Action URL' })
    @IsString()
    @IsOptional()
    actionUrl?: string;

    @ApiPropertyOptional({ description: 'Metadata as JSON string' })
    @IsString()
    @IsOptional()
    metadata?: string;

    @ApiPropertyOptional({ description: 'Expiration date' })
    @IsDateString()
    @IsOptional()
    expires?: Date;
}

export class NotificationResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    category: 'application' | 'user-centric' | 'discovery';

    @ApiProperty()
    isGlobal: boolean;

    @ApiProperty()
    priority: 'low' | 'medium' | 'high';

    @ApiPropertyOptional()
    actionUrl?: string;

    @ApiPropertyOptional()
    metadata?: string;

    @ApiPropertyOptional()
    expires?: Date;

    @ApiProperty()
    created: Date;

    @ApiProperty()
    updated: Date;

    // User-specific state (from UserNotificationView)
    @ApiPropertyOptional({ description: 'When user read the notification' })
    read?: Date;

    @ApiPropertyOptional({ description: 'When user archived the notification' })
    archived?: Date;

    @ApiPropertyOptional({ description: 'When user deleted the notification' })
    deleted?: Date;

    // Computed properties for backward compatibility
    @ApiProperty({ description: 'Whether user has read this notification' })
    isRead: boolean;
}
