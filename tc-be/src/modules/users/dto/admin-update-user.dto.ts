import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUpdateUserRoleDto {
    @ApiProperty({ 
        enum: ['super_user', 'admin', 'user', null], 
        description: 'User role - null removes admin privileges',
        required: true 
    })
    @IsEnum(['super_user', 'admin', 'user', null])
    role: 'super_user' | 'admin' | 'user' | null;
}

export class AdminUpdateUserStatusDto {
    @ApiProperty({ 
        description: 'Whether the user account is disabled',
        required: true 
    })
    @IsBoolean()
    disabled: boolean;
}

export class AdminUserListQueryDto {
    @ApiProperty({ required: false, description: 'Page number (starts from 1)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, description: 'Number of items per page' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @ApiProperty({ required: false, description: 'Filter by role' })
    @IsOptional()
    @IsEnum(['super_user', 'admin', 'regular'])
    role?: 'super_user' | 'admin' | 'regular';

    @ApiProperty({ required: false, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(['active', 'disabled'])
    status?: 'active' | 'disabled';

    @ApiProperty({ required: false, description: 'Search by email or name' })
    @IsOptional()
    @IsString()
    search?: string;
}
