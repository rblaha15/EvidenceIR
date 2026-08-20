import { env } from '$env/dynamic/private';
import type { EmailMessage } from '$lib/client/email';
import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter;

const getTransporter = () => {
    transporter ||= nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: env.EMAIL_USERNAME_G.also(console.log),
            pass: env.EMAIL_PASSWORD_G.also(console.log),
        },
    });

    return transporter;
}

export const sendEmail = (message: EmailMessage) => getTransporter().sendMail(message).thenAlso(console.log);