import { getIsAdmin } from '$lib/server/auth';
import { getAllIRs, getAllNSPs } from "$lib/server/db/admin/general";
import { error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals }) => {
    if (!getIsAdmin(locals)) return error(401);

    const irs = await getAllIRs();
    const nsps = await getAllNSPs();

    return new Response(JSON.stringify({ irs, nsps }))
};