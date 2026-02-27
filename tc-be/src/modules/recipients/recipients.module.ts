import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapsulesModule } from '../capsules/capsules.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { RecipientsController } from './controllers/recipients.controller';
import { RecipientNotification } from './entities/recipient-notifications.entity';
import { Recipient } from './entities/recipient.entity';
import { RecipientNotificationsService } from './services/recipient-notifications.service';
import { RecipientsService } from './services/recipients.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Recipient, RecipientNotification]),
        CapsulesModule,
        SubscriptionsModule
    ],
    providers: [RecipientsService, RecipientNotificationsService],
    controllers: [RecipientsController],
    exports: [RecipientsService, RecipientNotificationsService],
})
export class RecipientsModule {}