import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { ICapsule } from '../../../common/interfaces/models.interface';

export class CreateCapsuleDto implements Pick<ICapsule, 'name' | 'description' | 'openDate' | 'isPhysical' | 'lat' | 'lng'> {

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
    isOpen?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isPhysical?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lat?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lng?: string;
}
