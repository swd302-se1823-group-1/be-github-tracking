import { ICommand } from '@nestjs/cqrs';
import { GoogleProfileDto } from '../dtos/google-profile.dto';

import { GoogleLoginResult } from '../dtos/google-login.result';

export type GoogleLoginResponse = GoogleLoginResult;

export class GoogleLoginCommand implements ICommand {
  constructor(public readonly profile: GoogleProfileDto) {}
}
