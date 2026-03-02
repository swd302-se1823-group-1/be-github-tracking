export interface GitHubProfile {
  username: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  providerId: string;
  accessToken: string | null;
}
