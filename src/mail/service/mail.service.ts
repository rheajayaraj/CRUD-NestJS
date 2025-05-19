import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { join } from 'path';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const handlebarOptions = {
      viewEngine: {
        partialsDir: join(__dirname, '..', 'templates', 'partials'),
        defaultLayout: false,
        extname: '.hbs',
      },
      viewPath: join(__dirname, '..', 'templates'),
      extName: '.hbs',
    };

    this.transporter.use('compile', hbs(handlebarOptions));
  }

  async sendMail(to: string, subject: string, template: string, context: any) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      template,
      context,
      attachments: [
        {
          filename: 'image.webp',
          path: join(__dirname, '..', 'templates', 'image.webp'),
          cid: 'logo@company',
        },
      ],
    };

    return this.transporter.sendMail(mailOptions);
  }
}
