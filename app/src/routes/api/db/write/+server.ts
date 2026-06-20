import type { WriteDatabase } from '$lib/client/db/def';
import { getIsLoggedIn } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";
import { mongoWriteDatabase } from "$lib/server/db/write";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!getIsLoggedIn(locals)) return error(401);

    const { name, args } = (await request.json()) as {
        name: keyof WriteDatabase,
        args: Parameters<WriteDatabase[keyof WriteDatabase]>
    };

    const func = mongoWriteDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    await func(...args, locals);
    return new Response("ok");
};