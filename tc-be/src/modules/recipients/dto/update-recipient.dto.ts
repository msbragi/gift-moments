import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { IRecipient } from 'src/common/interfaces/models.interface';

export class UpdateRecipientDto implements Pick<IRecipient, 'userId' | 'fullName' | 'email' | 'openedAt'> {

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    userId?: number;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fullName?: string;

}
