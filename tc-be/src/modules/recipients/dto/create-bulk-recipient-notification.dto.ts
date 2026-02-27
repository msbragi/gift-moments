import { IsInt } from 'class-validator';

export class CreateBulkRecipientNotificationDto {
    @IsInt()
    capsuleId: number;
}