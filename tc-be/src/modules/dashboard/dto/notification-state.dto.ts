import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class SetNotificationStateDto {
    @ApiProperty({
        description: 'Action to perform on the notification',
        enum: ['read', 'unread', 'archive', 'unarchive', 'delete'],
        example: 'read'
    })
    @IsEnum(['read', 'unread', 'archive', 'unarchive', 'delete'])
    action: 'read' | 'unread' | 'archive' | 'unarchive' | 'delete';
}

export class SetAllNotificationsStateDto {
    @ApiProperty({
        description: 'Action to perform on all notifications',
        enum: ['read-all', 'unread-all', 'archive-all-read', 'unarchive-all', 'delete-all-read'],
        example: 'read-all'
    })
    @IsEnum(['read-all', 'unread-all', 'archive-all-read', 'unarchive-all', 'delete-all-read'])
    action: 'read-all' | 'unread-all' | 'archive-all-read' | 'unarchive-all' | 'delete-all-read';
}
