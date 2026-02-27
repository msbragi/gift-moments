import { IRecipientNotification } from '../../../common/interfaces/models.interface';

export class RecipientNotificationDto implements Pick<
    IRecipientNotification,
    'id' | 'created' | 'recipientId' | 'capsuleId' | 'type' | 'status' | 'sentAt' | 'scheduledFor' | 'errorMessage'
> {
    id?: number | null;
    created?: Date;
    recipientId: number;
    capsuleId: number;
    type: 'initial' | 'reminder' | 'custom';
    status: 'sent' | 'failed' | 'pending';
    sentAt: Date;
    scheduledFor?: Date | null;
}