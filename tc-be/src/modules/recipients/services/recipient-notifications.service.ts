import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Capsule } from 'src/modules/capsules/entities/capsule.entity';
import { CapsulesService } from 'src/modules/capsules/services/capsules.service';
import { Repository } from 'typeorm';
import { CreateRecipientNotificationDto } from '../dto/create-recipient-notification.dto';
import { UpdateRecipientNotificationDto } from '../dto/update-recipient-notification.dto';
import { RecipientNotification } from '../entities/recipient-notifications.entity';
import { RecipientsService } from './recipients.service';

@Injectable()
export class RecipientNotificationsService extends BaseService<RecipientNotification> {
    constructor(
        @InjectRepository(RecipientNotification)
        repository: Repository<RecipientNotification>,
        private readonly capsulesService: CapsulesService,
        private readonly recipientsService: RecipientsService
    ) {
        super(repository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        return true;
    }

    private createDefaultNotification(capsule: Capsule, recipientId: number, type: 'initial' | 'reminder' = 'initial'): CreateRecipientNotificationDto {
        let scheduledFor: Date | null = null;

        if (type === 'reminder' && capsule.openDate) {
            // Esempio: reminder 7 giorni prima dell'apertura
            scheduledFor = new Date(capsule.openDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return {
            recipientId,
            capsuleId: capsule.id,
            type: type,
            status: 'pending',
            sentAt: null,
            scheduledFor: scheduledFor,
            errorMessage: null,
        };
    }

    async createNotificationFromApi(userId: number, capsuleId: number, recipientId: number): Promise<RecipientNotification> {
        // 1. Check capsule ownership
        const capsule = await this.capsulesService.findOneWithDetails(capsuleId);
        if (!capsule || capsule.userId !== userId) {
            throw new ForbiddenException('You do not own this capsule.');
        }

        // 2. Check recipient assignment
        const recipients = await this.recipientsService.findByCapsule(capsuleId);
        const isAssigned = recipients.some(r => r.id === recipientId);
        if (!isAssigned) {
            throw new NotFoundException('Recipient not assigned to this capsule.');
        }

        // 3. Create notification with default values
        const dto: CreateRecipientNotificationDto = this.createDefaultNotification(capsule, recipientId);
        return super.create(dto);
    }

    async createBulkNotificationsFromApi(userId: number, capsuleId: number): Promise<RecipientNotification[]> {
        // 1. Check capsule ownership
        const capsule = await this.capsulesService.findOneWithDetails(capsuleId);
        if (!capsule || capsule.userId !== userId) {
            throw new ForbiddenException('You do not own this capsule.');
        }

        // 2. Get all recipients for this capsule
        const recipients = await this.recipientsService.findByCapsule(capsuleId);
        if (!recipients.length) {
            throw new NotFoundException('No recipients assigned to this capsule.');
        }

        // 3. Create notification for each recipient
        const notifications: RecipientNotification[] = [];
        for (const recipient of recipients) {
            const dto: CreateRecipientNotificationDto = this.createDefaultNotification(capsule, recipient.id);
            const notification = await super.create(dto);
            notifications.push(notification);
        }
        return notifications;
    }

    async updateNotification(userId: number, id: number, dto: UpdateRecipientNotificationDto): Promise<RecipientNotification> {
        return null;
    }

    async findAllByRecipient(userId: number, recipientId: number): Promise<RecipientNotification[]> {
        return null;
    }

    async findAllByCapsule(userId: number, capsuleId: number): Promise<RecipientNotification[]> {
        return null;
    }

    async findOneById(userId: number, id: number): Promise<RecipientNotification | null> {
        return null;
    }

    async deleteNotification(userId: number, id: number): Promise<void> {
        return null;
    }
}