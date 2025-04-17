import { EMAIL_PASSWORD_G, EMAIL_USERNAME_G } from "$env/static/private";
import nodemailer from 'nodemailer';
import type { EmailMessage } from '$lib/client/email';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USERNAME_G,
        pass: EMAIL_PASSWORD_G,
    },
});

export const sendEmail = (message: EmailMessage) => transporter.sendMail(message);