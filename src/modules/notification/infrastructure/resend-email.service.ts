import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ResendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface ResendClient {
  emails: { send: (payload: ResendEmailPayload) => Promise<unknown> };
}

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private resend: ResendClient | null = null;
  private readonly from: string;

  constructor(@Optional() private readonly configService: ConfigService) {
    const apiKey = configService?.get<string>('RESEND_API_KEY');
    this.from =
      configService?.get<string>('RESEND_FROM_EMAIL') ??
      'noreply@github-tracking.fptu.edu.vn';

    if (apiKey) {
      this.initResend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not set – email sending disabled');
    }
  }

  private initResend(apiKey: string): void {
    try {
      // Dynamic import so the app boots even if the package is not yet installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ResendModule = require('resend') as { Resend: new (key: string) => ResendClient };
      this.resend = new ResendModule.Resend(apiKey);
    } catch {
      this.logger.warn('resend package not installed – email sending disabled');
    }
  }

  async sendWarningEmail(opts: {
    toEmail: string;
    studentName: string;
    message: string;
    warningType: string;
  }): Promise<void> {
    if (!this.resend || !opts.toEmail) return;

    try {
      await this.resend.emails.send({
        from: this.from,
        to: opts.toEmail,
        subject: `⚠️ GitHub Tracking Warning – ${opts.warningType}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2>GitHub Tracking – Warning Notice</h2>
            <p>Dear <strong>${opts.studentName}</strong>,</p>
            <p>${opts.message}</p>
            <hr/>
            <p style="color:#888;font-size:12px">
              Sent automatically by the GitHub Tracking System (FPTU)
            </p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send email via Resend', err);
    }
  }
}
