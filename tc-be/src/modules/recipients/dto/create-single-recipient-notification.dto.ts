import { IsInt } from 'class-validator';

export class CreateSingleRecipientNotificationDto {
    @IsInt()
    capsuleId: number;

    @IsInt()
    recipientId: number;
}