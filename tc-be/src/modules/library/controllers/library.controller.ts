import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IMulterFileInterface } from 'src/common/interfaces/multer-file.interface';
import { CapsuleContentRow } from 'src/common/services/sqlite/interfaces';
import { SubscriptionsService } from 'src/modules/subscriptions/services/subscriptions.service';
import { User } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateLibraryItemDto } from '../dto/create-library-item.dto';
import { LibraryItemResponseDto } from '../dto/library-item-response.dto';
import { LibraryService } from '../services/library.service';

@ApiTags('library')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/library/items')
export class LibraryController {
    constructor(
        private readonly libraryService: LibraryService,
        private readonly subscriptionsService: SubscriptionsService
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all content in user library' })
    @ApiResponse({ status: 200, type: [LibraryItemResponseDto] })
    async findAllContent(
        @User('userId') userId: number,
    ) {
        return this.libraryService.findAllItems(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific content from user library' })
    @ApiResponse({
        status: 200,
        description: 'Returns the binary content with appropriate Content-Type header'
    })
    async findContent(
        @Param('id') id: string,
        @User('userId') userId: number,
        @Res() res: Response
    ) {
        try {
            const content = await this.libraryService.findContent(userId, +id);

            if (!content) {
                throw new NotFoundException(`Library content with id ${id} not found`);
            }
            
            // Ensure content.content is a Buffer
            if (!Buffer.isBuffer(content.content)) {
                console.error('Content is not a buffer:', typeof content.content);
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Invalid content format'
                });
            }

            res.set({
                'Content-Type': content.contentType,
                'Content-Disposition': `inline; filename="${content.name || 'download'}"`,
                'Cache-Control': 'max-age=3600'
            });

            // Send the binary data directly
            return res.send(content.content);
        } catch (error) {
            console.error(`Error retrieving content with id ${id}:`, error);
            throw error;
        }
    }

    @Get(':id/metadata')
    @ApiOperation({ summary: 'Get metadata for specific content' })
    @ApiResponse({ status: 200, type: LibraryItemResponseDto })
    async findContentMetadata(
        @Param('id') id: string,
        @User('userId') userId: number,
    ) {
        const item = await this.libraryService.findOneByUser(+id, userId);
        if (!item) {
            throw new NotFoundException(`Library content with id ${id} not found`);
        }
        return item;
    }

    @Post()
    @ApiOperation({ summary: 'Add content to user library' })
    @ApiResponse({ status: 201, type: LibraryItemResponseDto })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('content'))
    @ApiBody({
        description: 'File content to add to the library',
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    format: 'binary',
                },
                contentType: {
                    type: 'string',
                    example: 'image/jpeg',
                },
                name: {
                    type: 'string',
                    example: 'My vacation photo',
                },
            },
        },
    })
    async addContent(
        @UploadedFile() file: IMulterFileInterface,
        @Body() itemDto: CreateLibraryItemDto,
        @User('userId') userId: number,
    ) {
        try {
            // Validate that file exists
            if (!file) {
                throw new BadRequestException('No file uploaded. Please provide a file.');
            }

            // Ensure we have a buffer
            if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
                throw new BadRequestException('Invalid file format or empty file.');
            }
            const canAdd = await this.subscriptionsService.validateAddLibraryItem(userId, file.size);
            if (!canAdd) {
                throw new BadRequestException('Storage limit exceeded. Please upgrade your subscription.');   
            }
            const result = await this.libraryService.addContent(
                userId,
                {
                    userId: userId,
                    contentType: file.mimetype || itemDto.contentType,
                    content: file.buffer,
                    size: file.size,
                    name: itemDto.name || file.filename || file.originalname,
                } as CapsuleContentRow
            );

            // Handle case where result is null
            if (!result) {
                throw new NotFoundException('Failed to add content to library');
            }

            return result;
        } catch (error) {
            console.error('Error adding content to library:', error);
            throw error;
        }
    }

    @Post('external')
    @ApiOperation({ summary: 'Add external URL to user library' })
    @ApiResponse({ status: 201, type: LibraryItemResponseDto })
    @ApiBody({
        description: 'External URL data to add to the library',
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                },
                contentType: {
                    type: 'string',
                    example: 'video/youtube',
                },
                name: {
                    type: 'string',
                    example: 'My favorite video',
                },
                size: {
                    type: 'number',
                    example: 1024000,
                },
            },
            required: ['url', 'contentType'],
        },
    })
    async addExternalUrl(
        @Body() createLibraryItemDto: CreateLibraryItemDto,
        @User('userId') userId: number,
    ) {
        try {
            // Validate required fields for external URL
            if (!createLibraryItemDto.url) {
                throw new NotFoundException('URL is required for external content.');
            }

            if (!createLibraryItemDto.contentType) {
                throw new NotFoundException('Content type is required for external content.');
            }

            const result = await this.libraryService.addExternalUrl(
                userId,
                createLibraryItemDto.url,
                createLibraryItemDto.contentType,
                createLibraryItemDto.name,
                createLibraryItemDto.size
            );

            // Handle case where result is null
            if (!result) {
                throw new NotFoundException('Failed to add external URL to library');
            }

            return result;
        } catch (error) {
            console.error('Error adding external URL to library:', error);
            throw error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove content from user library' })
    @ApiResponse({ status: 200 })
    async removeContent(
        @Param('id') id: string,
        @User('userId') userId: number,
    ) {
        try {
            const deleted = await this.libraryService.removeContent(userId, +id);

            if (!deleted) {
                throw new NotFoundException(`Library content with id ${id} not found, is in use by a capsule, or delete failed`);
            }

            return { deleted: true };
        } catch (error) {
            console.error(`Error removing content with id ${id}:`, error);
            throw error;
        }
    }
}