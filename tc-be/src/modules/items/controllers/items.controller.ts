import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CapsuleContentRow } from 'src/common/services/sqlite/interfaces';
import { SubscriptionsService } from 'src/modules/subscriptions/services/subscriptions.service';
import { User } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IMulterFileInterface } from '../../../common/interfaces/multer-file.interface';
import { CapsuleItemResponseDto } from '../dto/capsule-item-response.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { ItemsService } from '../services/items.service';

@ApiTags('capsules')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/capsules/:capsuleId/items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
        private readonly subscriptionsService: SubscriptionsService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Add content to a capsule' })
    @ApiResponse({ status: 201, type: CapsuleItemResponseDto })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('content'))
    @ApiBody({
        description: 'File content to add to the capsule',
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
                    example: 'My aweosome photo',
                },
            },
        },
    })

    async addContent(
        @Param('capsuleId') capsuleId: string,
        @UploadedFile() file: IMulterFileInterface,
        @Body() createItemDto: CreateItemDto,
        @User('userId') userId: number,
    ) {
        // Validate that file exists
        if (!file) {
            throw new BadRequestException('No file uploaded. Please provide a file.');
        }

        // Ensure we have a buffer
        if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
            throw new BadRequestException('Invalid file format or empty file.');
        }
        const canAdd = await this.subscriptionsService.validateAddItem(userId, +capsuleId, file.size);
        if(!canAdd) {
            throw new BadRequestException('Items limit or file size exceed this capsule limits. Please check your subscription limits.');
        }
        return this.itemsService.addContent(
            userId,
            +capsuleId,
            {
                userId: +userId,
                contentType: file.mimetype || createItemDto.contentType,
                size: file.size || createItemDto.size,
                content: file.buffer,
                name: createItemDto.name || file.filename || file.originalname,
            } as CapsuleContentRow
        );
    }

    @Get()
    @ApiOperation({ summary: 'List all content in a capsule' })
    @ApiResponse({ status: 200, type: [CapsuleItemResponseDto] })
    async findAllContent(
        @Param('capsuleId') capsuleId: string,
        @User('userId') userId: number,
    ) {
        return this.itemsService.findAllItems(userId, +capsuleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific content from a capsule' })
    @ApiResponse({
        status: 200,
        description: 'Returns the binary content with appropriate Content-Type header'
    })
    async findContent(
        @Param('capsuleId') capsuleId: string,
        @Param('id') id: string,
        @User('userId') userId: number,
        @Res() res: Response
    ) {
        const content = await this.itemsService.findContent(userId, +capsuleId, +id);

        if (!content) {
            return res.status(404).json({
                statusCode: 404,
                message: `Item with id ${id} not found in capsule ${capsuleId}`
            });
        }

        // Ensure content.content is a Buffer
        if (!Buffer.isBuffer(content.content)) {
            console.error('Content is not a buffer:', typeof content.content);
            return res.status(500).json({
                statusCode: 500,
                message: 'Invalid content format'
            });
        }

        // Set the appropriate headers for the content type
        res.setHeader('Content-Type', content.contentType);
        res.setHeader('Content-Disposition', `inline; filename="item-${id}.jpg"`);
        res.setHeader('Cache-Control', 'max-age=3600');

        // Send the binary data directly
        return res.end(content.content);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove content from a capsule' })
    @ApiResponse({ status: 200 })
    async removeContent(
        @Param('capsuleId') capsuleId: string,
        @Param('id') id: string,
        @User('userId') userId: number,
    ) {
        const deleted = await this.itemsService.removeContent(userId, +capsuleId, +id);

        if (!deleted) {
            throw new NotFoundException(`Item with id ${id} not found in capsule ${capsuleId} or delete failed`);
        }
        return { deleted: true };
    }

    @Post('external')
    @ApiOperation({ summary: 'Add external URL to a capsule' })
    @ApiResponse({ status: 201, type: CapsuleItemResponseDto })
    @ApiBody({
        description: 'External URL data to add to the capsule',
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
                    example: 'video/mp4',
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
        @Param('capsuleId') capsuleId: string,
        @Body() createItemDto: CreateItemDto,
        @User('userId') userId: number,
    ) {
        try {
            // Validate required fields for external URL
            if (!createItemDto.url) {
                throw new NotFoundException('URL is required for external content.');
            }

            if (!createItemDto.contentType) {
                throw new NotFoundException('Content type is required for external content.');
            }

            const result = await this.itemsService.addExternalUrl(
                userId,
                +capsuleId,
                createItemDto.url,
                createItemDto.contentType,
                createItemDto.name,
                createItemDto.size
            );

            // Handle case where result is null
            if (!result) {
                throw new NotFoundException('Failed to add external URL to capsule');
            }

            return result;
        } catch (error) {
            console.error('Error adding external URL to capsule:', error);
            throw error;
        }
    }

    @Post('from-library/:libraryItemId')
    @ApiOperation({ summary: 'Add library item to a capsule' })
    @ApiResponse({ status: 201, type: CapsuleItemResponseDto })
    async addFromLibrary(
        @Param('capsuleId') capsuleId: string,
        @Param('libraryItemId') libraryItemId: string,
        @User('userId') userId: number,
    ) {
        const item = await this.itemsService.addFromLibrary(
            userId,
            +capsuleId,
            +libraryItemId
        );

        if (!item) {
            throw new NotFoundException(
                `Library item with id ${libraryItemId} not found or cannot be added to capsule ${capsuleId}`
            );
        }

        return item;
    }
}