import { Module } from '@nestjs/common';
import { SQLiteModule } from 'src/common/services/sqlite/sqlite.module';
import { CapsuleContentController } from './capsule-content.controller';
import { LibraryContentController } from './library-content.controller';

@Module({
  controllers: [CapsuleContentController, LibraryContentController],
  imports: [
    SQLiteModule
  ]
})
export class ContentsModule {}