import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { ICapsule } from 'src/common/interfaces/models.interface';

export class UpdateCapsuleDto implements Pick<ICapsule, 'name' | 'description' | 'openDate' | 'isOpen' | 'isPhysical' | 'lat' | 'lng'> {

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({ required: false })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    openDate: Date;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isPhysical?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isOpen?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lat?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lng?: string;

}
