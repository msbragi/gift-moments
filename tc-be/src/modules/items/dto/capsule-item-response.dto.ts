import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CapsuleItemResponseDto {
    @ApiProperty({ description: 'Item ID' })
    id: number;

    @ApiPropertyOptional({ description: 'Content ID in SQLite database (null for external URLs)' })
    contentId?: number;

    @ApiProperty({ description: 'Content type', example: 'image/jpeg' })
    contentType: string;

    @ApiPropertyOptional({ description: 'Content size in bytes' })
    size?: number;

    @ApiProperty({ description: 'Item name' })
    name: string;

    @ApiPropertyOptional({ description: 'External URL for remote content' })
    url?: string;

    @ApiProperty({ description: 'Creation date' })
    created: Date;

    @ApiProperty({ description: 'Last update date' })
    updated: Date;
}