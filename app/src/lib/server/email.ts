import { EMAIL_PASSWORD_G, EMAIL_USERNAME_G } from "$env/static/private";
import type { Options } from "nodemailer/lib/mailer";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USERNAME_G,
        pass: EMAIL_PASSWORD_G,
    },
});

export const sendEmail = (message: Options) => transporter.sendMail(message);