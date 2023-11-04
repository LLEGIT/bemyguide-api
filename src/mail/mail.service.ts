import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserResetPassword(user: User, token: string) {
    const url = `http://${process.env.IP_ADDRESS}:3000/password/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'BMG - Réinitialisation de votre mot de passe',
      template: './reset-password',
      context: {
        name: user.username,
        url,
      },
    });
  }

  async sendUserTripInvitation(user: string, email: string, id: ObjectId) {
    const url = `http://${process.env.IP_ADDRESS}:3000/trip/invitation?id=${id}`;
    const registeredUrl = `http://${process.env.IP_ADDRESS}:3000/register`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'BMG - Vous avez été invité à un voyage',
      template: './trip-invitation',
      context: {
        name: user,
        url,
        registeredUrl,
      },
    });
  }
}
