import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from '../capsules/entities/capsule.entity';
import { Item } from '../items/entities/item.entity';
import { LibraryItem } from '../library/entities/library-item.entity';
import { Recipient } from '../recipients/entities/recipient.entity';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Capsule,
            Item,
            Recipient,
            LibraryItem
        ])
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }