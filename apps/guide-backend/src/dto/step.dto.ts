import { ApiProperty } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({ example: 'Install CPU' })
  title: string;

  @ApiProperty({ example: 'Carefully insert the CPU into the socket, aligning the golden triangle.' })
  body: string;

  @ApiProperty({ example: 2 })
  order: number;

  @ApiProperty({ example: 5, required: false })
  estimateMinutes?: number;

  @ApiProperty({
    example: 'https://example.com/photos/install-cpu.jpg',
    required: false,
    description: 'Photo or short video URL'
  })
  mediaUrl?: string;

  @ApiProperty({
    example: 'photo',
    required: false,
    description: 'Type of media: photo or video'
  })
  mediaType?: 'photo' | 'video';
}
