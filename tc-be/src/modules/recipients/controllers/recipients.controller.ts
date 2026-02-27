import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { SubscriptionsService } from 'src/modules/subscriptions/services/subscriptions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateBulkRecipientNotificationDto } from '../dto/create-bulk-recipient-notification.dto';
import { CreateRecipientDto } from '../dto/create-recipient.dto';
import { CreateSingleRecipientNotificationDto } from '../dto/create-single-recipient-notification.dto';
import { UpdateRecipientDto } from '../dto/update-recipient.dto';
import { Recipient } from '../entities/recipient.entity';
import { RecipientNotificationsService } from '../services/recipient-notifications.service';
import { RecipientsService } from '../services/recipients.service';

@ApiTags('capsules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/capsules/:capsuleId/recipients')
export class RecipientsController {
    constructor(
        private readonly recipientsService: RecipientsService,
        private readonly subscriptionService: SubscriptionsService,
        private readonly recipientNotificationsService: RecipientNotificationsService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create recipient' })
    @ApiResponse({ status: 201, type: Recipient })
    async create(
        @Param('capsuleId') capsuleId: string,
        @Body() createRecipientDto: CreateRecipientDto
    ) {
        // ...existing logic...
        const canAdd = await this.subscriptionService.validateAddRecipient(createRecipientDto.userId, createRecipientDto.capsuleId);
        if (!canAdd) {
            throw new BadRequestException('Recipient limit exceeded for this capsule. Please check your subscription limits.');
        }
        return this.recipientsService.create(createRecipientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Find all recipients for a capsules' })
    @ApiResponse({ status: 200, type: [Recipient] })
    async findAll(
        @Param('capsuleId') capsuleId: string
    ) {
        return this.recipientsService.findByCapsule(+capsuleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find recipient by id' })
    @ApiResponse({ status: 200, type: Recipient })
    async findOne(
        @Param('capsuleId') capsuleId: string,
        @Param('id') id: string
    ) {
        return this.recipientsService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update recipient' })
    @ApiResponse({ status: 200, type: Recipient })
    async update(
        @Param('capsuleId') capsuleId: string,
        @Param('id') id: string,
        @Body() updateRecipientDto: UpdateRecipientDto
    ) {
        return this.recipientsService.update(+id, updateRecipientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete recipient' })
    @ApiResponse({ status: 200 })
    async remove(
        @Param('capsuleId') capsuleId: string,
        @Param('id') id: string
    ) {
        return this.recipientsService.remove(+id);
    }

    @Post('notify')
    @ApiOperation({ summary: 'Notify to one recipient for this capsule' })
    @ApiResponse({ status: 201 })
    async notifyOneRecipient(
        @User('userId') userId: number,
        @Body() dto: CreateSingleRecipientNotificationDto
    ) {
        return this.recipientNotificationsService.createNotificationFromApi(
            userId,
            dto.capsuleId,
            dto.recipientId
        );
    }

    @Post('notify-all')
    @ApiOperation({ summary: 'Notify all recipients for this capsule' })
    @ApiResponse({ status: 201 })
    async notifyAllRecipients(
        @User('userId') userId: number,
        @Body() dto: CreateBulkRecipientNotificationDto
    ) {
        return this.recipientNotificationsService.createBulkNotificationsFromApi(
            userId,
            dto.capsuleId
        );
    }

}
