import type { DatabaseEndpoints } from '$lib/client/db/endpoints';
import type { RequestHandler } from './$types';
import handle from './handle';

export const POST: RequestHandler = async ({ request, url, locals }) => {
    const action = url.searchParams.get('other') as keyof DatabaseEndpoints;
    const args = await request.json();

    const result = handle({ ...args, action }, locals, request.headers, url.origin);

    return new Response(JSON.stringify(result), {
        status: Number(200),
    });
};