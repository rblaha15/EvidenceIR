import { getAllIRs, getAllNSPs } from "$lib/server/db/admin/general";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async () => {
    const irs = await getAllIRs();
    const nsps = await getAllNSPs();

    return new Response(JSON.stringify({ irs, nsps }))
};