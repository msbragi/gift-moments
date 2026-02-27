#!/bin/bash

# Create Base Service
cat > src/common/services/base.service.ts << 'EOF'
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export abstract class BaseService<T extends BaseEntity> {
    constructor(private readonly repository: Repository<T>) {}

    async create(createDto: any): Promise<T> {
        const entity = this.repository.create(createDto);
        return await this.repository.save(entity);
    }

    async findAll(options?: FindManyOptions<T>): Promise<T[]> {
        return await this.repository.find(options);
    }

    async findOne(id: number, options?: FindOneOptions<T>): Promise<T> {
        return await this.repository.findOne({ where: { id }, ...options });
    }

    async update(id: number, updateDto: any): Promise<T> {
        await this.repository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}
EOF

# Create Users Service
cat > src/modules/users/services/users.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService extends BaseService<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        if (createUserDto.password) {
            const salt = await bcrypt.genSalt();
            createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
        }
        return super.create(createUserDto);
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email } });
    }
}
EOF

# Create Capsules Service
cat > src/modules/capsules/services/capsules.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Capsule } from '../entities/capsule.entity';

@Injectable()
export class CapsulesService extends BaseService<Capsule> {
    constructor(
        @InjectRepository(Capsule)
        private readonly capsuleRepository: Repository<Capsule>,
    ) {
        super(capsuleRepository);
    }

    async findByUser(userId: number): Promise<Capsule[]> {
        return this.capsuleRepository.find({
            where: { userId },
            relations: ['items', 'recipients']
        });
    }
}
EOF

# Create Items Service
cat > src/modules/items/services/items.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Item } from '../entities/item.entity';

@Injectable()
export class ItemsService extends BaseService<Item> {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
    ) {
        super(itemRepository);
    }

    async findByCapsule(capsuleId: number): Promise<Item[]> {
        return this.itemRepository.find({
            where: { capsuleId },
            relations: ['capsule']
        });
    }
}
EOF

# Create Recipients Service
cat > src/modules/recipients/services/recipients.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Recipient } from '../entities/recipient.entity';

@Injectable()
export class RecipientsService extends BaseService<Recipient> {
    constructor(
        @InjectRepository(Recipient)
        private readonly recipientRepository: Repository<Recipient>,
    ) {
        super(recipientRepository);
    }

    async findByCapsule(capsuleId: number): Promise<Recipient[]> {
        return this.recipientRepository.find({
            where: { capsuleId },
            relations: ['capsule']
        });
    }
}
EOF
