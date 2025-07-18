import type { RequestHandler } from './$types';
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';
import type { EmailMessage } from '$lib/client/email';
import { Readable } from 'node:stream';
import type { Attachment } from 'nodemailer/lib/mailer';

export type FinalEmailMessage = Omit<EmailMessage, 'attachments'> & {
    attachments?: Attachment[];
}

export const POST: RequestHandler = async ({ url, request }) => {
    const token = url.searchParams.get('token');

    if (!(await checkToken(token))) error(401, 'Unauthorized');

    const { message }: { message: EmailMessage } = await request.json();
    console.log(message)

    message.attachments?.forEach((a, i) => {
        const c = a.content;
        if (c && typeof c != 'string' && !(c instanceof Readable) && !('compare' in c)) {
            message.attachments![i].content = Buffer.from(c)
        }
    })

    console.log("Sending!")
    const { response } = await sendEmail(message as FinalEmailMessage);
    console.log(response)

    return new Response(null, {
        status: Number(response.slice(0, 3)),
    });
};