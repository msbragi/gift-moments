import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class CreateItemDto {
    @ApiProperty({ description: 'Content type', example: 'image/jpeg' })
    @IsString()
    contentType: string;

    @ApiPropertyOptional({ description: 'Item name', example: 'My vacation photo' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: 'External URL for remote content', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
    @IsUrl()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({ description: 'Content size in bytes', example: 1024000 })
    @IsNumber()
    @IsOptional()
    size?: number;
}