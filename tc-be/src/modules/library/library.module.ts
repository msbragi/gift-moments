import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { LibraryController } from './controllers/library.controller';
import { LibraryItem } from './entities/library-item.entity';
import { LibraryService } from './services/library.service';
import { SQLiteModule } from 'src/common/services/sqlite/sqlite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryItem]),
    SubscriptionsModule,
    SQLiteModule
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService]
})
export class LibraryModule {}