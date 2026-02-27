#!/bin/bash

# Create User Entity
cat > src/modules/users/entities/user.entity.ts << 'EOF'
import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IUser } from '../../../common/interfaces/models.interface';
import { Capsule } from '../../capsules/entities/capsule.entity';

@Entity('users')
export class User extends BaseEntity implements IUser {
    @ApiProperty()
    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password?: string;

    @ApiProperty()
    @Column({ nullable: true })
    fullName?: string;

    @ApiProperty()
    @Column({ default: false })
    isFromGoogle?: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    avatar?: string;

    @OneToMany(() => Capsule, capsule => capsule.user)
    capsules?: Capsule[];
}
EOF

# Create Capsule Entity
cat > src/modules/capsules/entities/capsule.entity.ts << 'EOF'
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ICapsule } from '../../../common/interfaces/models.interface';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';
import { Recipient } from '../../recipients/entities/recipient.entity';

@Entity('capsules')
export class Capsule extends BaseEntity implements ICapsule {
    @ApiProperty()
    @Column()
    userId: number;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @Column()
    openDate: Date;

    @ApiProperty()
    @Column({ default: false })
    isPhisical?: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    lat?: string;

    @ApiProperty()
    @Column({ nullable: true })
    lng?: string;

    @ManyToOne(() => User, user => user.capsules)
    user?: User;

    @OneToMany(() => Item, item => item.capsule)
    items?: Item[];

    @OneToMany(() => Recipient, recipient => recipient.capsule)
    recipients?: Recipient[];
}
EOF

# Create Item Entity
cat > src/modules/items/entities/item.entity.ts << 'EOF'
import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IItem } from '../../../common/interfaces/models.interface';
import { Capsule } from '../../capsules/entities/capsule.entity';

@Entity('items')
export class Item extends BaseEntity implements IItem {
    @ApiProperty()
    @Column()
    capsuleId: number;

    @ApiProperty()
    @Column()
    type: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    data?: any;

    @ApiProperty()
    @Column({ nullable: true })
    url?: string;

    @ManyToOne(() => Capsule, capsule => capsule.items)
    capsule?: Capsule;
}
EOF

# Create Recipient Entity
cat > src/modules/recipients/entities/recipient.entity.ts << 'EOF'
import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IRecipient } from '../../../common/interfaces/models.interface';
import { Capsule } from '../../capsules/entities/capsule.entity';

@Entity('recipients')
export class Recipient extends BaseEntity implements IRecipient {
    @ApiProperty()
    @Column()
    capsuleId: number;

    @ApiProperty()
    @Column({ nullable: true })
    userId?: number;

    @ApiProperty()
    @Column()
    email: string;

    @ManyToOne(() => Capsule, capsule => capsule.recipients)
    capsule?: Capsule;
}
EOF

# Create DTOs
cat > src/modules/users/dto/create-user.dto.ts << 'EOF'
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { IUser } from '../../../common/interfaces/models.interface';

export class CreateUserDto implements Pick<IUser, 'email' | 'password' | 'fullName' | 'isFromGoogle' | 'avatar'> {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isFromGoogle?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    avatar?: string;
}
EOF
