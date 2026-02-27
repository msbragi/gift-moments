import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { UserNotification } from './user-notification.entity';

@Entity('user_notifications_view')
export class UserNotificationView extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'notification_id' })
    notificationId: number;

    @ApiProperty()
    @Column({ name: 'user_id' })
    userId: number;

    @ApiProperty()
    @Column({ name: 'read', type: 'timestamp', nullable: true })
    read?: Date;

    @ApiProperty()
    @Column({ name: 'archived', type: 'timestamp', nullable: true })
    archived?: Date;

    // Relations
    @ManyToOne(() => UserNotification, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notification_id' })
    notification: UserNotification;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
