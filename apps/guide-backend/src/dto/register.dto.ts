import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @ApiProperty({ example: 'Alice Wonderland' })
  @IsOptional()
  name?: string;
}
