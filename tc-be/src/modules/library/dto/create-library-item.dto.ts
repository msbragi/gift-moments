import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ILibraryItem } from 'src/common/interfaces/models.interface';

export class CreateLibraryItemDto {
    @ApiProperty({
        description: 'Content type of the file',
        example: 'image/jpeg',
        required: false,
    })
    @IsString()
    @IsOptional()
    contentType?: string;

    @ApiProperty({
        description: 'Name of the library item',
        example: 'My vacation photo',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'External URL for the content (alternative to file upload)',
        example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        required: false,
    })
    @IsUrl()
    @IsOptional()
    url?: string;

    @ApiProperty({
        description: 'Size of the content in bytes (for external URLs, can be estimated)',
        example: 1024000,
        required: false,
    })
    @IsOptional()
    size?: number;
}