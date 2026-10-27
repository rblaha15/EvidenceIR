import type { WriteDatabase } from '$lib/client/db/def';
import { getIsLoggedIn } from '$lib/server/auth';
import { mongoWriteDatabase } from '$lib/server/db/write';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import '$lib/extensions';

export const POST: RequestHandler = async ({ request, url, locals, fetch }) => {
    if (!getIsLoggedIn(locals)) return error(401);

    const name = url.searchParams.get('name') as keyof WriteDatabase;
    const { args } = (await request.json()) as {
        args: Parameters<WriteDatabase[keyof WriteDatabase]>
    };

    const func = mongoWriteDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    await func({ locals, fetch }, ...args);
    return new Response('ok');
};