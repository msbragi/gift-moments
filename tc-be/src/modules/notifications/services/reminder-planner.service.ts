import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Capsule } from 'src/modules/capsules/entities/capsule.entity';
import { CapsulesService } from 'src/modules/capsules/services/capsules.service';
import { RecipientNotification } from 'src/modules/recipients/entities/recipient-notifications.entity';
import { SubscriptionDataHelper } from 'src/modules/subscriptions/utils/subscription-data.helper';
import { Between, IsNull, Repository } from 'typeorm';

@Injectable()
export class ReminderPlannerService {
    private readonly logger = new Logger(ReminderPlannerService.name);
    private readonly REMINDER_OFFSETS_DAYS: number[];

    constructor(
        private readonly capsulesService: CapsulesService,
        @InjectRepository(RecipientNotification)
        private readonly notificationRepo: Repository<RecipientNotification>,
        private readonly configService: ConfigService,
    ) {
        // Offsets in days before capsule expiry for reminders
        const envOffsets = this.configService.get<string>('REMINDER_OFFSETS_DAYS');
        this.REMINDER_OFFSETS_DAYS = envOffsets
            ? envOffsets.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v))
            : [15, 7, 3, 1];
    }

    /**
     * Batch job: Plans reminder notifications for capsules expiring soon.
     */
    async planReminders(): Promise<void> {
        const now = new Date();
        const maxOffset = Math.max(...this.REMINDER_OFFSETS_DAYS);
        const windowEnd = new Date(now.getTime() + maxOffset * 24 * 60 * 60 * 1000);

        // Use findAll with appropriate where and relations
        const capsules = await this.capsulesService.findAll({
            where: {
                deleted: IsNull(),
                openDate: Between(now, windowEnd),
            },
            relations: [
                'recipients',
                'subscriptions',
                'subscriptions.subscriptionPlan'
            ],
        });

        let created = 0;
        let skipped = 0;

        for (const capsule of capsules) {
            if (!capsule.openDate || !capsule.recipients?.length) continue;
            if (this.isCapsuleExpired(capsule)) continue;

            for (const offset of this.REMINDER_OFFSETS_DAYS) {
                const scheduledFor = new Date(capsule.openDate.getTime() - offset * 24 * 60 * 60 * 1000);
                if (scheduledFor <= now) continue;

                for (const recipient of capsule.recipients) {
                    // Check if a reminder already exists (not soft-deleted)
                    const exists = await this.notificationRepo.exists({
                        where: {
                            recipientId: recipient.id,
                            capsuleId: capsule.id,
                            type: 'reminder',
                            scheduledFor,
                            deleted: IsNull(),
                        }
                    });

                    if (exists) {
                        skipped++;
                        continue;
                    }

                    await this.notificationRepo.save(this.notificationRepo.create({
                        recipientId: recipient.id,
                        capsuleId: capsule.id,
                        type: 'reminder',
                        status: 'pending',
                        scheduledFor,
                    }));
                    created++;
                }
            }
        }

        this.logger.log(`Reminder planning complete. Created: ${created}, Skipped: ${skipped}`);
    }

    /**
    * Checks if a capsule is expired based on its subscriptions and plans.
    * For now, always returns true (to be implemented).
    */
    private isCapsuleExpired(capsule: Capsule): boolean {
        if (!capsule.subscriptions?.length) return true;
        // Capsule is expired if ALL subscriptions are expired
        return capsule.subscriptions.every(sub =>
            SubscriptionDataHelper.isExpired(sub)
        );
    }

}