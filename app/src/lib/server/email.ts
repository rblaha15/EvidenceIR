import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import type { EmailMessage } from '$lib/client/email';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL_USERNAME_G,
        pass: env.EMAIL_PASSWORD_G,
    },
});

export const sendEmail = (message: EmailMessage) => transporter.sendMail(message);