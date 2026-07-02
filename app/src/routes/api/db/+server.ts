import type { DatabaseEndpoints } from '$lib/client/db/endpoints';
import type { RequestHandler } from './$types';
import handle from './handle';

export const POST: RequestHandler = async ({ request, url, locals }) => {
    const action = url.searchParams.get('action') as keyof DatabaseEndpoints;
    const args = await request.json();
    console.log(action, args);
    const result = await handle({ ...args, action }, locals);

    return new Response(JSON.stringify(result), {
        status: Number(200),
    });
};