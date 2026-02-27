import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserNotificationViewDto {
    @ApiProperty({ description: 'Notification ID' })
    @IsNumber()
    notificationId: number;

    @ApiProperty({ description: 'User ID' })
    @IsNumber()
    userId: number;

    @ApiPropertyOptional({ description: 'When user read the notification' })
    @IsDateString()
    @IsOptional()
    read?: Date;

    @ApiPropertyOptional({ description: 'When user archived the notification' })
    @IsDateString()
    @IsOptional()
    archived?: Date;
}

export class UpdateUserNotificationViewDto {
    @ApiPropertyOptional({ description: 'When user read the notification' })
    @IsDateString()
    @IsOptional()
    read?: Date;

    @ApiPropertyOptional({ description: 'When user archived the notification' })
    @IsDateString()
    @IsOptional()
    archived?: Date;
}

export class UserNotificationViewResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    notificationId: number;

    @ApiProperty()
    userId: number;

    @ApiPropertyOptional()
    read?: Date;

    @ApiPropertyOptional()
    archived?: Date;

    @ApiProperty()
    created: Date;

    @ApiProperty()
    updated: Date;

    @ApiPropertyOptional()
    deleted?: Date;
}
