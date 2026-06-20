import type { ReadDatabase } from '$lib/client/db/def';
import { getIsLoggedIn } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";
import { mongoReadDatabase } from "$lib/server/db/read";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!getIsLoggedIn(locals)) return error(401);

    const { name, args } = (await request.json()) as {
        name: keyof ReadDatabase,
        args: Parameters<ReadDatabase[keyof ReadDatabase]>
    };

    const func = mongoReadDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    const result = await func(...args, locals);
    return new Response(JSON.stringify(result))
};