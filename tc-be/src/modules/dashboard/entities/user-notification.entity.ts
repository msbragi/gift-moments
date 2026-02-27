import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('user_notifications')
export class UserNotification extends BaseEntity {

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column('text')
    message: string;

    @ApiProperty()
    @Column()
    type: string; // 'version-update', 'capsule-countdown', 'recipient-opened', etc.

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: ['application', 'user-centric', 'discovery'],
        default: 'user-centric'
    })
    category: 'application' | 'user-centric' | 'discovery';

    @ApiProperty()
    @Column({ name: 'is_global', default: false })
    isGlobal: boolean;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    })
    priority: 'low' | 'medium' | 'high';

    @ApiProperty()
    @Column({ name: 'action_url', nullable: true })
    actionUrl?: string;

    @ApiProperty()
    @Column({ name: 'metadata', type: 'text', nullable: true })
    metadata?: string; // JSON stringificato per dati extra come countdown, statistiche, etc.

    @ApiProperty()
    @Column({ name: 'expires', type: 'timestamp', nullable: true })
    expires?: Date; // Per notifiche temporanee
}
