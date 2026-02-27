import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { IUser } from '../../../common/interfaces/models.interface';

export class CreateUserDto implements Pick<IUser, 'email' | 'password' | 'fullName' | 'isFromGoogle' | 'avatar' | 'verifyToken'> {
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

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    verifyToken?: string;
    
    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;
}
