import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateItemDto {
    @ApiPropertyOptional({ description: 'Content type', example: 'image/jpeg' })
    @IsString()
    @IsOptional()
    contentType?: string;

    @ApiPropertyOptional({ description: 'Item name', example: 'My vacation photo' })
    @IsString()
    @IsOptional()
    name?: string;
}