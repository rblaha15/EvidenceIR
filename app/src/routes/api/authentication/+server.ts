
import type { RequestHandler } from './$types';
import handle from './handle.ts';

export const POST: RequestHandler = async ({ request, url }) => {

    const args = await request.json();

    const result = handle(args, request.headers, url.origin);

    return new Response(JSON.stringify(result), {
        status: Number(200),
    });
};