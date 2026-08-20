import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import type { EmailMessage } from '$lib/client/email';

const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP_HOST,
    port: Number(env.EMAIL_SMTP_PORT),
    secure: env.EMAIL_SMTP_SECURE != 'false',
    requireTLS: env.EMAIL_SMTP_SECURE != 'false',
    logger: true,
    debug: true,
    auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
    },
});

export const sendEmail = (message: EmailMessage) => transporter.sendMail(message);