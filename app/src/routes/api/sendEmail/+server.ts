import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';
// import { del } from '@vercel/blob';
import type { EmailMessage } from '$lib/client/email';
import type { RequestHandler } from './$types';
// import { EMAIL_BLOB_READ_WRITE_TOKEN } from "$env/static/private";

export const POST: RequestHandler = async ({ url, request }) => {
    const token = url.searchParams.get('token');

    if (!(await checkToken(token))) error(401, 'Unauthorized');

    const message: EmailMessage = await request.json();
    console.log(message)

    console.log("Sending!")
    const { response } = await sendEmail(message);
    console.log(response)

    // await message.attachments?.map(a => {
    //     del(a.path, { token: EMAIL_BLOB_READ_WRITE_TOKEN })
    // }).awaitAll()

    return new Response(null, {
        status: Number(response.slice(0, 3)),
    });
};