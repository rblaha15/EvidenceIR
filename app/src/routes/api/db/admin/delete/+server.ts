import type { RequestHandler } from "./$types";
import type { IRID } from "$lib/helpers/ir";
import { deletePermanentlyIR } from "$lib/server/db/admin/general";

export const POST: RequestHandler = async ({ request }) => {
    const { irid } = (await request.json()) as {
        irid: IRID,
    };

    await deletePermanentlyIR(irid);

    return new Response("ok");
};