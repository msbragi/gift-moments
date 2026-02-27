import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getDatabaseConfig } from './config/database.config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CapsulesModule } from './modules/capsules/capsules.module';
import { ContentsModule } from './modules/content/contents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ItemsModule } from './modules/items/items.module';
import { LibraryModule } from './modules/library/library.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RecipientsModule } from './modules/recipients/recipients.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    controllers: [AppController],
    imports: [
        // Scheduler
        ScheduleModule.forRoot(),
        // Configuration
        ConfigModule.forRoot({ isGlobal: true }),
        // Events emitter
        EventEmitterModule.forRoot(),
        // Rate limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ttl: config.get('THROTTLE_TTL', 60),
                limit: config.get('THROTTLE_LIMIT', 10),
                skipIf: () => config.get('NODE_ENV') === 'development',
                throttlers: [], // Add an empty array or configure as needed
            }),
        }),
        // Database - Dynamic Configuration
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => getDatabaseConfig(config),
        }),
        // Feature modules
        AuthModule,
        UsersModule,
        CapsulesModule,
        ItemsModule,
        RecipientsModule,
        LibraryModule,
        ContentsModule,
        DashboardModule,
        AdminModule,
        SubscriptionsModule,
        PaymentsModule,
        NotificationsModule,

    ],
    providers: [
        AppService,
        // Global guards
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        // Global interceptors
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        }
    ],
})
export class AppModule { }
