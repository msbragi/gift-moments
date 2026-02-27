import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService, INotificationEmail } from 'src/modules/email/email.service';
import { RecipientNotification } from 'src/modules/recipients/entities/recipient-notifications.entity';
import { IsNull, LessThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);
  private readonly BATCH_SIZE = 50;

  constructor(
    @InjectRepository(RecipientNotification)
    private readonly notificationRepo: Repository<RecipientNotification>,
    private readonly emailService: EmailService,
  ) { }

  /**
   * Dispatches all pending notifications that are due.
   * - Finds notifications with status 'pending' and scheduledFor <= now (not soft-deleted)
   * - Sends the notification (e.g., via email)
   * - Updates status to 'sent' or 'failed' and logs errors
   */
  async dispatchPending(): Promise<void> {

    // Find pending notifications ready to be sent
    const notifications = await this.createQuery().getMany();

    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      if (!notification.recipient.email) continue;

      try {
        const emailNotify: INotificationEmail = {
          userId: notification.capsule.user.id,
          userFullName: notification.capsule.user.fullName,
          email: notification.recipient.email,
          name: notification.recipient.fullName,
          title: notification.capsule?.name,
          openDate: notification.capsule?.openDate
            ? new Date(notification.capsule.openDate).toLocaleDateString() : ''
        };

        if(notification.type === 'reminder') {
          await this.emailService.sendReminderEmail(emailNotify);
        } else if(notification.type === 'initial') {
          await this.emailService.sendInitialEmail(emailNotify);
        } else {
          this.logger.warn(`Unknown notification type: ${notification.type}`);
          continue;
        }

        await this.notificationRepo.update(notification.id, {
          status: 'sent',
          sentAt: new Date(),
        });
        sent++;
      } catch (error: any) {
        await this.notificationRepo.update(notification.id, {
          status: 'failed',
          errorMessage: error?.message?.substring(0, 250) || 'Unknown error',
        });
        failed++;
        this.logger.error(
          `Failed to send notification ${notification.id}: ${error?.message}`,
        );
      }
    }

    this.logger.log(
      `Notification dispatch complete. Sent: ${sent}, Failed: ${failed}`,
    );
  }

  /**
   * Returns pending notifications to be dispatched using QueryBuilder.
   */
  private createQuery(): SelectQueryBuilder<RecipientNotification> {
    const now = new Date();
    const qb = this.notificationRepo.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .leftJoinAndSelect('notification.capsule', 'capsule')
      .leftJoinAndSelect('notification.capsule.user', 'user')

      .where(`notification.status = 'pending' AND notification.deleted IS NULL`)
      .andWhere(
        `((notification.type = 'reminder' AND notification.scheduledFor <= :now)
         OR (notification.type = 'initial' AND notification.scheduledFor IS NULL))`,
        { now }
      )
      .take(this.BATCH_SIZE)
      .select([
        'notification.id',
        'notification.status',
        'notification.type',
        'notification.scheduledFor',
        'recipient.id',
        'recipient.fullName',
        'recipient.email',
        'capsule.id',
        'capsule.name',
        'capsule.openDate',
      ]);
      return qb;
  }

}