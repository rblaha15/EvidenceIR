import type { RequestHandler } from './$types';
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';
import type { EmailMessage, EmailOptions } from '$lib/client/email';

export const POST: RequestHandler = async ({ url, request, fetch }) => {
    const token = url.searchParams.get('token');

    if (!(await checkToken(token))) error(401, 'Unauthorized');

    const { message }: { message: EmailMessage } = await request.json();

    if (message.pdf) {
        const pdfResponse = await fetch(`${message.pdf.link}?token=${token}`);
        message.attachments = [
            ...message.attachments ?? [],
            {
                content: Buffer.from(await pdfResponse.arrayBuffer()),
                contentType: 'application/pdf',
                filename: message.pdf.title,
            },
        ];
    }

    const { response } = await sendEmail(message);

    return new Response(null, {
        status: Number(response.slice(0, 3)),
    });
};