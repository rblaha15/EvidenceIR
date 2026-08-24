import { env } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import type { EmailMessage, ServerEmailMessage } from '$lib/client/email';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

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

const uploadDir = 'tmp/attachments';

export const emailEndpoints = {
    sendEmail: defineEndpoint<{ message: EmailMessage }, SentMessageInfo>(
        async ({ message }) => await sendEmail({
            ...message,
            attachments: await message.attachments?.map(async ({ id, filename, contentType }) => {
                const buffer = await readFile(`${uploadDir}/${id}`);
                await rm(`${uploadDir}/${id}`);
                return {
                    content: buffer,
                    filename,
                    contentType,
                }
            }).awaitAll(),
        }),
        { requireLoggedIn: true },
    ),
    uploadAttachment: defineEndpoint<File, { id: string }>(async file => {
        const id = crypto.randomUUID();
        await mkdir(uploadDir, { recursive: true });
        await writeFile(`${uploadDir}/${id}`, Buffer.from(await file.arrayBuffer()));
        return { id };
    }, { requireLoggedIn: true, isFileUpload: true }),
};

export const sendEmail = (message: ServerEmailMessage) => transporter.sendMail(message);