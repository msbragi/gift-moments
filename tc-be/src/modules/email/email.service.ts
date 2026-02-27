import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

export interface INotificationEmail {
  userId: number;
  userFullName: string;
  email: string;
  name?: string;
  title?: string;
  openDate?: string; // formatted date string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly emailSubjects: Record<string, any>;
  private readonly supportedLanguages: string[];
  private readonly defaultLanguage = 'en';
  private emailBcc: string = '';

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    // Load supported languages from .env
    const langs = configService.get<string>('MAIL_LANGUAGES', 'en');
    this.supportedLanguages = langs.split(',').map(l => l.trim()).filter(Boolean);

    // Load email subjects from JSON
    const subjectsPath = join(__dirname, 'templates/email-subjects.json');
    try {
      this.emailSubjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf-8'));
      this.logger.log(`Loaded email subjects for languages: ${Object.keys(this.emailSubjects).join(', ')}`);
    } catch (err) {
      this.logger.error(`Failed to load email subjects: ${err.message}`);
      this.emailSubjects = {};
    }

    const bccEmail = configService.get<string>('MAIL_BCC', 'm.sbragi@gmail.com');
    this.emailBcc = this.validateBccEmail(bccEmail);
  }

  /**
   * Send an email verification to a user
   * @param email User's email address
   * @param token Verification token
   * @param language User's preferred language
   */
  async sendVerificationEmail(email: string, token: string, language = 'en'): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    const context = {
      name: email.split('@')[0], // Use part before @ as name
      verificationUrl,
    };
    await this._send(email, 'verification', 'verification', context, language);
  }

  /**
   * Send a password reset email to a user
   * @param email User's email address
   * @param token Reset token
   * @param language User's preferred language
   */
  async sendPasswordResetEmail(email: string, token: string, language = 'en'): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const context = {   
      name: email.split('@')[0], // Use part before @ as name
      resetUrl,
      expiresIn: '1 hour',
    };
    await this._send(email, 'passwordReset', 'reset-password', context, language);
  }

  /**
   * Send a confirmation after password has been reset
   * @param email User's email address
   * @param language User's preferred language
   */
  async sendPasswordChangedConfirmation(email: string, language = 'en'): Promise<void> {
    const context = {
      name: email.split('@')[0],
    };  
    await this._send(email, 'passwordChanged', 'password-changed', context, language);
  }

  /**
   * Send a reminder email to a recipient for a capsule.
   * @param notification RecipientNotification entity (with recipient and capsule relations loaded)
   * @param language Optional language code (default: 'en')
   */

  // Public methods
  async sendReminderEmail(data: INotificationEmail, language: string = 'en'): Promise<void> {
    return this.sendNotificationEmail(data, 'reminder', language);
  }

  /**
   * Send a reminder email to a recipient for a capsule.
   * @param notification RecipientNotification entity (with recipient and capsule relations loaded)
   * @param language Optional language code (default: 'en')
   */
  async sendInitialEmail(data: INotificationEmail, language: string = 'en'): Promise<void> {
    return this.sendNotificationEmail(data, 'assign', language);
  }

  private async sendNotificationEmail(
    data: INotificationEmail,
    type: 'reminder' | 'assign',
    language: string = 'en'
  ): Promise<void> {
    const {
      userId,
      userFullName,
      email,
      name,
      title,
      openDate,
    } = data;

    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const signinUrl = `${baseUrl}/login`;

    const context = {
      userFullName: userFullName || 'Someone you know',
      name: name || email.split('@')[0],
      capsuleTitle: title || 'A Time Capsule for you',
      openDate: openDate ? new Date(openDate).toLocaleDateString() : '',
      signinUrl,
    };

    switch (type) {
      case 'assign':
        await this._send(email, 'assign', 'notify-assign', context, language);
        break;
      case 'reminder':
      default:
        await this._send(email, 'reminder', 'notify-reminder', context, language);
        break;
    }
  }

  /**
   * Send an email verification to a user
   * @param email User's email address
   * @param type Email type 
   * @param context Email context
   * @param language User's preferred language
   */
  private async _send(email: string, type: string, template: string, context: any, language = 'en'): Promise<void> {
    this.validateEmail(email); // Check email is valid and RFC compliant

    // Select language folder or fallback to default
    const templateLang = this.getSupportedLanguage(language);
    const subject = this.emailSubjects[templateLang][type] || this.emailSubjects.en[type];

    try {
      await this.mailerService.sendMail({
        to: email,
        bcc: this.emailBcc, // BCC for admin monitoring
        subject: subject,
        template: `./${templateLang}/${template}`, // Path includes language subfolder
        context: context
      });
      this.logger.log(`An email ${type} was sent to ${email} in ${templateLang}`);
    } catch (error) {
      this.logger.error(`Failed to send ${type} email to ${email}: ${error.message}`);
      throw error;
    }

  }

  /**
     * Verify if language is supported, otherwise return default
     * @param language Language code
     * @returns Supported language code
     */
  private getSupportedLanguage(language: string): string {
    if (!language || !this.supportedLanguages.includes(language)) {
      return this.defaultLanguage;
    }
    return language;
  }

  /**
   * Validate email format
   * @param email Email address to validate
   * @throws BadRequestException if email is invalid
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email address is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new BadRequestException('Invalid email address format');
    }

    // Additional checks
    if (email.length > 254) { // RFC 5321 limit
      throw new BadRequestException('Email address too long');
    }
  }

  /**
   * Validate and sanitize BCC email
   * @param bccEmail BCC email to validate
   * @returns Valid BCC email or empty string
   */
  private validateBccEmail(bccEmail: string): string {
    if (!bccEmail) return '';

    try {
      this.validateEmail(bccEmail);
      return bccEmail.trim();
    } catch {
      this.logger.warn(`Invalid BCC email address: ${bccEmail}, BCC disabled`);
      return '';
    }
  }

}