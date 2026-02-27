import { ApiProperty } from '@nestjs/swagger';

export class LibraryItemResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the library item',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'User ID of the owner',
        example: 1
    })
    userId: number;

    @ApiProperty({
        description: 'Content ID in the SQLite database (null for external URLs)',
        example: 1,
        required: false
    })
    contentId: number | null;

    @ApiProperty({
        description: 'External URL for the content (alternative to file content)',
        example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        required: false
    })
    url: string | null;

    @ApiProperty({
        description: 'MIME type of the content',
        example: 'image/jpeg'
    })
    contentType: string;

    @ApiProperty({
        description: 'Size of the content in bytes',
        example: 1024000,
        required: false
    })
    size: number | null;

    @ApiProperty({
        description: 'Name of the library item',
        example: 'My vacation photo'
    })
    name: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2025-05-05T08:18:11.395Z'
    })
    created: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2025-05-05T08:18:11.395Z'
    })
    updated: Date;
}