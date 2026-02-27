import { Module } from '@nestjs/common';
import { SQLiteService } from './sqlite.service';
import { SQLiteConnectionManager } from './sqlite-connection-manager';

@Module({
  providers: [SQLiteConnectionManager, SQLiteService],
  exports: [SQLiteConnectionManager, SQLiteService],
})
export class SQLiteModule {}