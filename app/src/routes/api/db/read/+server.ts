import type { ReadDatabase } from '$lib/client/db/def';
import { getIsLoggedIn } from '$lib/server/auth';
import { mongoReadDatabase } from '$lib/server/db/read';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, locals }) => {
    if (!getIsLoggedIn(locals)) return error(401);

    const name = url.searchParams.get('name') as keyof ReadDatabase;
    const { args } = (await request.json()) as {
        args: Parameters<ReadDatabase[keyof ReadDatabase]>
    };

    const func = mongoReadDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    const result = await func(...args, locals);
    return new Response(JSON.stringify(result));
};