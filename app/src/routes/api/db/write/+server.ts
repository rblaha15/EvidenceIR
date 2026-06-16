import type { RequestHandler } from "./$types";
import { mongoWriteDatabase } from "$lib/server/db/write";

export const POST: RequestHandler = async ({ request }) => {
    const { name, args } = (await request.json()) as {
        name: keyof typeof mongoWriteDatabase,
        args: Parameters<typeof mongoWriteDatabase[keyof typeof mongoWriteDatabase]>
    };

    const func = mongoWriteDatabase[name];

    // @ts-expect-error TS doesn't know it's a tuple
    await func(...args);
    return new Response("ok");
};