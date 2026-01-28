import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'Cloudinary URL of the uploaded avatar',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/avatars/avatar_user123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Cloudinary public ID',
    example: 'github-tracking/avatars/avatar_user123',
  })
  publicId: string;

  @ApiProperty({
    description: 'Image width in pixels',
    example: 400,
  })
  width: number;

  @ApiProperty({
    description: 'Image height in pixels',
    example: 400,
  })
  height: number;

  @ApiProperty({
    description: 'Image format',
    example: 'jpg',
  })
  format: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 45678,
  })
  bytes: number;

  constructor(partial: Partial<UploadAvatarResponseDto>) {
    Object.assign(this, partial);
  }
}
