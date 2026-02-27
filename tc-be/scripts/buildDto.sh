#!/bin/bash

# Create User DTOs
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

cat > src/modules/users/dto/update-user.dto.ts << 'EOF'
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
EOF

# Create Capsule DTOs
cat > src/modules/capsules/dto/create-capsule.dto.ts << 'EOF'
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ICapsule } from '../../../common/interfaces/models.interface';

export class CreateCapsuleDto implements Pick<ICapsule, 'userId' | 'name' | 'description' | 'openDate' | 'isPhisical' | 'lat' | 'lng'> {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    openDate: Date;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isPhisical?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lat?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lng?: string;
}
EOF

cat > src/modules/capsules/dto/update-capsule.dto.ts << 'EOF'
import { PartialType } from '@nestjs/swagger';
import { CreateCapsuleDto } from './create-capsule.dto';

export class UpdateCapsuleDto extends PartialType(CreateCapsuleDto) {}
EOF

# Create Item DTOs
cat > src/modules/items/dto/create-item.dto.ts << 'EOF'
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { IItem } from '../../../common/interfaces/models.interface';

export class CreateItemDto implements Pick<IItem, 'capsuleId' | 'type' | 'data' | 'url'> {
    @ApiProperty()
    @IsNumber()
    capsuleId: number;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty({ required: false })
    @IsOptional()
    data?: any;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    url?: string;
}
EOF

cat > src/modules/items/dto/update-item.dto.ts << 'EOF'
import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
EOF

# Create Recipient DTOs
cat > src/modules/recipients/dto/create-recipient.dto.ts << 'EOF'
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';
import { IRecipient } from '../../../common/interfaces/models.interface';

export class CreateRecipientDto implements Pick<IRecipient, 'capsuleId' | 'userId' | 'email'> {
    @ApiProperty()
    @IsNumber()
    capsuleId: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    userId?: number;

    @ApiProperty()
    @IsEmail()
    email: string;
}
EOF

cat > src/modules/recipients/dto/update-recipient.dto.ts << 'EOF'
import { PartialType } from '@nestjs/swagger';
import { CreateRecipientDto } from './create-recipient.dto';

export class UpdateRecipientDto extends PartialType(CreateRecipientDto) {}
EOF

# Make script executable