import { EMAIL_PASSWORD, EMAIL_USERNAME } from "$env/static/private";
import type { Options } from "nodemailer/lib/mailer";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.centrum.cz',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
    }
});

export const sendEmail = (message: Options) => transporter.sendMail(message);