import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLiteModule } from 'src/common/services/sqlite/sqlite.module';
import { CapsulesModule } from '../capsules/capsules.module';
import { LibraryModule } from '../library/library.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ItemsController } from './controllers/items.controller';
import { Item } from './entities/item.entity';
import { ItemsService } from './services/items.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Item]),
        SubscriptionsModule,
        CapsulesModule,
        LibraryModule,
        SQLiteModule
    ],
    providers: [ItemsService],
    controllers: [ItemsController],
    exports: [ItemsService],
})
export class ItemsModule { }
