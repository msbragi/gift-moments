import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { IRecipientNotification } from 'src/common/interfaces/models.interface';
import { Recipient } from 'src/modules/recipients/entities/recipient.entity';
import { Capsule } from 'src/modules/capsules/entities/capsule.entity';

@Entity('recipients_notifications')
export class RecipientNotification extends BaseEntity implements IRecipientNotification {
    @Column({ name: 'recipient_id', type: 'int' })
    recipientId: number;

    @Column({ name: 'capsule_id', type: 'int' })
    capsuleId: number;

    @Column({ type: 'varchar', length: 32 })
    type: 'initial' | 'reminder' | 'custom';

    @Column({ type: 'varchar', length: 16, default: 'sent' })
    status: 'sent' | 'failed' | 'pending';

    @Column({ name: 'sent_at', type: 'datetime', nullable: true })
    sentAt: Date | null;

    @Column({ name: 'scheduled_for', type: 'datetime', nullable: true })
    scheduledFor?: Date | null;

    @Column({ name: 'error_message', type: 'varchar', length: 255, nullable: true })
    errorMessage?: string | null;

    @ManyToOne(() => Recipient, recipient => recipient.id, { eager: false })
    @JoinColumn({ name: 'recipient_id' })
    recipient?: Recipient;

    @ManyToOne(() => Capsule, capsule => capsule.id, { eager: false })
    @JoinColumn({ name: 'capsule_id' })
    capsule?: Capsule;
}