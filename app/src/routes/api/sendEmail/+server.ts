import type { RequestHandler } from './$types';
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';
import type { EmailMessage } from '$lib/client/email';

export const POST: RequestHandler = async ({ url, request, fetch }) => {
    const token = url.searchParams.get('token');

    if (!(await checkToken(token))) error(401, 'Unauthorized');

    const { message }: { message: EmailMessage } = await request.json();
    console.log(message)

    console.log("Sending!")
    const { response } = await sendEmail(message);
    console.log(response)

    return new Response(null, {
        status: Number(response.slice(0, 3)),
    });
};