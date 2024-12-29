import type { RequestHandler } from './$types';
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';
import type { Options } from 'nodemailer/lib/mailer';
import { generateXML } from '$lib/createXML';

export const POST: RequestHandler = async ({ url, request, fetch }) => {
    const token = url.searchParams.get('token');

    if (!(await checkToken(token))) error(401, 'Unauthorized');

    const { message }: { message: Options } = await request.json();

    if (message.subject!.includes('RegulusRoute')) {
        const pdfResponse = await fetch(`/cs/detail/${message.subject!.split(' ').slice(-2).join('')}/pdf/rroute?token=${token}`);
        message.attachments = [
            ...message.attachments ?? [],
            {
                content: Buffer.from(await pdfResponse.arrayBuffer()),
                contentType: 'application/pdf',
                filename: 'Souhlas RegulusRoute.pdf'
            },
        ];
    }

    const { response } = await sendEmail(message);

    return new Response(null, {
        status: Number(response.slice(0, 3))
    });
};
