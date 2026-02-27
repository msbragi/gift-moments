import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IRecipient } from '../../../common/interfaces/models.interface';
import { Capsule } from '../../capsules/entities/capsule.entity';
import { RecipientNotification } from './recipient-notifications.entity';
import { Expose } from 'class-transformer';

@Entity('recipients')
export class Recipient extends BaseEntity implements IRecipient {
    @ApiProperty()
    @Column({ name: 'capsule_id', nullable: false })
    capsuleId: number;

    @ApiProperty()
    @Column({ name: 'user_id', nullable: true })
    userId?: number;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty()
    @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
    openedAt?: Date;

    @ApiProperty()
    @Column({ name: 'full_name', nullable: true })
    fullName?: string;

    // Virtual field - not stored in DB, computed from openedAt
    @ApiProperty()
    get hasOpened(): boolean {
        return this.openedAt !== null && this.openedAt !== undefined;
    }

    @ApiProperty()
    @Expose()
    get notified(): boolean {
        return !!this.notifications && this.notifications.length > 0;
    }    
    
    @OneToMany(() => RecipientNotification, notification => notification.recipient)
    @JoinColumn({ name: 'recipient_id' })  // Specify the actual column name
    notifications?: RecipientNotification[];

    @ManyToOne(() => Capsule)
    @JoinColumn({ name: 'capsule_id' })  // Specify the actual column name
    capsule: Capsule;
}
