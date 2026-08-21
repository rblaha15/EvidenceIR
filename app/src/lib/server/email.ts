import { env } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import nodemailer from 'nodemailer';
import type { EmailMessage } from '$lib/client/email';

const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP_HOST,
    port: Number(env.EMAIL_SMTP_PORT),
    secure: env.EMAIL_SMTP_SECURE != 'false',
    ignoreTLS: env.EMAIL_SMTP_SECURE == 'false',
    logger: true,
    debug: true,
    auth: {
        user: publicENV.PUBLIC_EMAIL_SENDER,
        pass: env.EMAIL_PASSWORD,
    },
});

export const sendEmail = (message: EmailMessage) => transporter.sendMail(message);