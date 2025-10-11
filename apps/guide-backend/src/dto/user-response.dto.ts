// users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'b7c7a4a8-9f8e-4c3f-bc6d-91b7f0d8a1d4' })
  id: string;

  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiProperty({ example: 'Alice Wonderland', nullable: true })
  name?: string;

  @ApiProperty({ example: '/uploads/profile/alice.jpg', nullable: true })
  profilePhoto?: string;

  @ApiProperty({ example: UserRole.USER, enum: UserRole })
  role: UserRole;

  @ApiProperty({ example: '2025-09-18T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-18T10:00:00.000Z' })
  updatedAt: Date;
}
