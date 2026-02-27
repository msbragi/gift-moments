import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
//  { email: 'john.doe@example.com', plain: 'Password123!', hash: '$2b$10$6jXzGktP/UuXW6FLwbBfN.eJ1.U1LjYHyqIbBnEd.nB3QB6qJtIwG' },
//  { email: 'jane.smith@example.com', plain: 'JanePass456!', hash: '$2b$10$8jXzGktP/UuXW6FLwbBfN.eJ1.U1LjYHyqIbBnEd.nB3QB6qJtIwG' }

  @ApiProperty({example: 'john.doe@example.com', required: true})
  @IsEmail()
  email: string;

  @ApiProperty({example: 'Password123!', required: true})
  @IsString()
  password: string;
}
