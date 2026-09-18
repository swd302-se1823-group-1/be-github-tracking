import {
  CommandHandler,
  ICommandHandler,
  QueryBus,
  CommandBus,
} from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { GoogleLoginCommand } from '@/modules/auth/application/commands/google-login.command';
import { GoogleLoginResult } from '@/modules/auth/application/dtos/google-login.result';
import { TokenService } from '@/modules/auth/application/services/token.service';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';
import { RefreshToken } from '@/modules/auth/domain/aggregates/refresh-token.aggregate';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { generateId } from '@/shared/utils/uuid';
import { FindUserByEmailQuery } from '@/modules/identity/application/queries/user/find-user-by-email.query';
import { UpdateUserGoogleInfoCommand } from '@/modules/identity/application/commands/user/update-user-google-info.command';
import { CreateUserCommand } from '@/modules/identity/application/commands/user/create-user.command';
import { FindUserByProviderIdQuery } from '@/modules/identity/application/queries/user/find-user-by-provider-id.query';

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<
  GoogleLoginCommand,
  GoogleLoginResult
> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly tokenService: TokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  @Transactional()
  async execute(command: GoogleLoginCommand): Promise<GoogleLoginResult> {
    const { profile } = command;
    const { email, providerId, firstName, lastName, picture } = profile;

    if (!email) {
      throw new BadRequestException('Email not found from Google provider');
    }

    // 1. Try to find user by provider ID (already linked to Google)
    let user = await this.queryBus.execute<
      FindUserByProviderIdQuery,
      UserAggregate | null
    >(new FindUserByProviderIdQuery(providerId));

    // 2. If not found, try by email (user might exist but not linked to Google yet)
    if (!user) {
      user = await this.queryBus.execute<
        FindUserByEmailQuery,
        UserAggregate | null
      >(new FindUserByEmailQuery(email));

      // If user exists by email, link their Google account via CommandBus
      if (user) {
        user = await this.commandBus.execute<
          UpdateUserGoogleInfoCommand,
          UserAggregate
        >(
          new UpdateUserGoogleInfoCommand(
            user.id.toString(),
            providerId,
            picture,
          ),
        );
      }
    }

    // 3. If user still doesn't exist, create new STUDENT user
    if (!user) {
      user = await this.commandBus.execute<CreateUserCommand, UserAggregate>(
        new CreateUserCommand(
          email,
          `${firstName} ${lastName}`,
          'google',
          providerId,
          picture,
          UserRole.STUDENT, // Default role for new OAuth users
        ),
      );
    }

    const tokens = await this.tokenService.generateAuthTokens({
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = new RefreshToken({
      id: generateId(),
      jti: tokens.jti,
      userId: user.id.toString(),
      deviceId: 'google-oauth', // Or pass from command if available
      expiresAt: tokens.refreshTokenExpiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName || null,
        avatarUrl: user.avatarUrl || null,
        role: user.role,
      },
    };
  }
}
