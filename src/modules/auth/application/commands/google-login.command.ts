import { GoogleProfileDto } from '../dtos/google-profile.dto';

export class GoogleLoginCommand {
  constructor(public readonly profile: GoogleProfileDto) {}
}
