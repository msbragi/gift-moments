import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
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

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fullName?: string;

}
