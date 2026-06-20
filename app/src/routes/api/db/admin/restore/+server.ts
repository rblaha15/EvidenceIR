import { getIsAdmin } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";
import type { IRID } from "$lib/helpers/ir";
import { restoreIR } from "$lib/server/db/admin/general";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!getIsAdmin(locals)) return error(401);

    const { irid } = (await request.json()) as {
        irid: IRID,
    };

    await restoreIR(irid);

    return new Response("ok");
};