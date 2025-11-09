import '$lib/extensions';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getAllIRs, getAllSPs } from '$lib/server/firestore';
import { checkAdmin, checkToken } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
    const t = url.searchParams.get('token');
    const token = await checkToken(t);
    if (!token) error(401);
    if (!await checkAdmin(token)) error(403);

    const ir = await getAllIRs();
    const nsp = await getAllSPs();

    return json({ ir, nsp });
};