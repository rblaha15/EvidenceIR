import type { RequestHandler } from "./$types";
import { mongoReadDatabase } from "$lib/server/db/read";

export const POST: RequestHandler = async ({ request }) => {
    const { name, args } = (await request.json()) as {
        name: keyof typeof mongoReadDatabase,
        args: Parameters<typeof mongoReadDatabase[keyof typeof mongoReadDatabase]>
    };

    const func = mongoReadDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    const result = await func(...args);
    return new Response(JSON.stringify(result))
};