import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipientNotificationDto } from './create-recipient-notification.dto';

export class UpdateRecipientNotificationDto extends PartialType(CreateRecipientNotificationDto) {}