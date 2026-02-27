import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GlobalActivityQueryDto {
    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 10;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    @ApiPropertyOptional({
        enum: ['user-registered', 'capsule-created-public', 'capsule-created-private', 'stats-weekly', 'stats-monthly']
    })
    @IsOptional()
    @IsEnum(['user-registered', 'capsule-created-public', 'capsule-created-private', 'stats-weekly', 'stats-monthly'])
    type?: string;
}

export class NotificationQueryDto {
    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    unreadOnly?: boolean;

    @ApiPropertyOptional({ description: 'Include archived notifications' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    includeArchived?: boolean;

    @ApiPropertyOptional({ description: 'Show only archived notifications' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    archivedOnly?: boolean;

    @ApiPropertyOptional({
        enum: ['application', 'user-centric', 'discovery']
    })
    @IsOptional()
    @IsEnum(['application', 'user-centric', 'discovery'])
    category?: 'application' | 'user-centric' | 'discovery';
}
