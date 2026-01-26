import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export class AuthUserDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  @Expose()
  fullName: string | null;

  @ApiProperty({ example: 'https://avatar.url', nullable: true })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @Expose()
  role: UserRole;

  constructor(partial: Partial<AuthUserDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @Expose()
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto })
  @Expose()
  @Type(() => AuthUserDto)
  user: AuthUserDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
