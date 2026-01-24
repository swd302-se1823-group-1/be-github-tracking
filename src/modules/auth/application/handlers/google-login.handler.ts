import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@/modules/auth/domain/repositories/user.repository';
import { generateId } from '@/shared/utils/uuid';
import { GoogleLoginCommand } from '@/modules/auth/application/commands/google-login.command';
import { TokenService } from '@/modules/auth/application/services/token.service';
import { User } from '@/modules/auth/domain/aggregates/user.aggregate';
import { UserRole } from '@/modules/auth/domain/enums/user-role.enum';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';
import { RefreshToken } from '@/modules/auth/domain/aggregates/refresh-token.aggregate';

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<GoogleLoginCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    command: GoogleLoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { profile } = command;
    const { email, providerId, firstName, lastName, picture } = profile;

    if (!email) {
      throw new Error('Email not found from Google provider');
    }

    let user = await this.userRepository.findByProviderId(providerId);

    if (!user) {
      user = await this.userRepository.findByEmail(email);
    }

    if (user) {
      if (!user.providerId || user.provider !== 'google') {
        // Use Domain Method
        user.updateGoogleInfo(providerId, picture || undefined);
        await this.userRepository.update(user);
      }
    } else {
      // Create new user using Aggregate
      user = new User({
        id: generateId(), // Generate ID here (Domain Service/Factory pattern)
        email,
        fullName: [firstName, lastName].filter(Boolean).join(' '),
        avatarUrl: picture,
        provider: 'google',
        providerId: providerId,
        role: UserRole.STUDENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.create(user);
    }

    const tokens = await this.tokenService.generateAuthTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = new RefreshToken({
      id: generateId(),
      jti: tokens.jti,
      userId: user.id,
      deviceId: 'google-oauth', // Or from req if available?
      expiresAt: tokens.refreshTokenExpiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user, // Return aggregate, or map to DTO? specific DTO is better but Aggregate works for now
    };
  }
}
