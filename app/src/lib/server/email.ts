import { env } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import { type EmailMessage, SENDER, type ServerEmailMessage } from '$lib/client/email';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { ImapFlow } from 'imapflow';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import type { Options } from 'nodemailer/lib/mailer';
import type { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

const imap = new ImapFlow({
    host: env.EMAIL_IMAP_HOST,
    port: Number(env.EMAIL_IMAP_PORT),
    secure: env.EMAIL_IMAP_SECURE != 'false',
    auth: {
        user: publicENV.PUBLIC_EMAIL_SENDER,
        pass: env.EMAIL_PASSWORD,
    },
    logger: false,
});
await imap.connect();

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
                };
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

export const sendEmail = async (message: ServerEmailMessage) => {
    const mail = new MailComposer(message).compile();

    const envelope = mail.getEnvelope();
    const raw = await mail.build();

    const response = await transporter.sendMail({ envelope, raw } as Options);
    await imap.append('Odesláno ze SEIR', raw, ['\\Seen']);
    setTimeout(checkForUndeliveredEmails, 60_000);

    return response;
};

const emailBody = (
    addresses: string[],
    from: string,
    to: string,
    cc: string,
    subject: string,
    date: string,
    originalText: string,
) => `Email nebyl doručen na následující adresy:
${addresses.join('\n')}

Původní zpráva:
Odesílatel: ${from}
Příjemci: ${to}
Kopie: ${cc}
Předmět: ${subject}
Datum: ${date}

${originalText}`;

const checkForUndeliveredEmails = async () => {
    const lock = await imap.getMailboxLock('INBOX');

    try {
        const found = [];
        for await (const message of imap.fetch('1:*', { envelope: true, flags: true }))
            if (!message.flags?.has('\\Seen') && message.envelope!.from![0]!.name! == 'REGULUS_GWDOM.GWIA.GATEWAY')
                found.push(message.uid);
        for (const uid of found) {
            const message = await imap.fetchOne(uid, { source: true }, { uid: true });
            if (!message) continue;

            const text = message.source!.toString();

            const a = 'The message that you sent was undeliverable to the following:=20';
            const b = 'Information about your message:=20';
            const c = 'Possibly truncated original message follows:=20';
            const reasons = text.after(a).before(b).trim();
            const reasonList = reasons.split('\t').map(text => text.trim());
            const originalMessage = '\n' + text.after(c).trim();
            const addresses = reasonList.map(text => text.before(' ').trim());
            const id = originalMessage.after('Message-ID: ').before('\n').trim();
            const from = originalMessage.after('From: ').before('\n').trim();
            const to = originalMessage.after('To: ').replace(/,\r?\n/, ', ').before('\n').trim();
            const cc = originalMessage.after('Cc: ').before('\n').trim();
            const subject = originalMessage.after('Subject: ').before('\n').trim();
            const date = originalMessage.after('Date: ').before('\n').trim();
            const originalText = originalMessage.after('text/plain')
                .after('\n\n').after('\r\n\r\n').before('----').trim();

            const response: Options = {
                from: SENDER(),
                to: ['radek.blaha.15@gmail.com'],
                subject: 'Email nedoručen',
                text: emailBody(addresses, from, to, cc, subject, date, originalText),
                inReplyTo: id,
            };

            const mail = new MailComposer(response).compile();

            const envelope = mail.getEnvelope();
            const raw = await mail.build();

            await transporter.sendMail({ envelope, raw } as Options);
            await imap.append('Odesláno ze SEIR', raw, ['\\Seen']);

            await imap.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
            await imap.messageMove(uid, 'Trash', { uid: true });
        }
    } finally {
        lock.release();
    }
};
