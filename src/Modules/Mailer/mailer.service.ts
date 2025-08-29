import { Injectable } from '@nestjs/common';
import { config } from '../../Settings/config';
import nodemailer from 'nodemailer';

let mailTransporter: nodemailer.Transporter;
export async function initMailer() {
  mailTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: config.MAILER_ADDRESS,
      pass: config.MAILER_PASSWORD,
    },
  });
  await mailTransporter.verify();
  console.log('Mailer initialized successfully.');
}

@Injectable()
export class MailerService {
  async sendEmailWithConfirmationCode(
    targetEmail: string,
    code: string,
    type: string,
  ) {
    await mailTransporter.sendMail({
      from: `Sendling <${config.MAILER_ADDRESS}>`,
      to: targetEmail,
      subject: 'Email confirmation',
      html: this.EmailConfirmationMailTemplate(code, type),
    });
  }

  private EmailConfirmationMailTemplate(
    code: string,
    queryParam: string,
  ): string {
    return `<h1>Confirmation code</h1>
 <p>To finish confirmation please follow the link below:
     <a href='${config.CURRENT_URL}?${queryParam}=${code}'>Confirmation code</a>
 </p>`;
  }
}
