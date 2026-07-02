import '$lib/extensions';
import { checkUserByEmail } from '$lib/server/db/admin/auth';
import { error, json, type RequestHandler, text } from '@sveltejs/kit';
import { getIsAdmin, getIsLoggedIn } from '$lib/server/auth';
import { getAllLoyaltyProgramData } from '$lib/server/db/arrays';
import { dev } from '$app/environment';
import { type LoyaltyProgramPointsTransaction } from '$lib/client/loyaltyProgram';
import { addPointsTransaction } from '$lib/server/loyaltyProgram';

export const GET: RequestHandler = async ({ locals }) => {
    if (!dev && !getIsLoggedIn(locals)) error(401);
    if (!dev && !getIsAdmin(locals)) error(403);

    return json(await getAllLoyaltyProgramData());
};

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!dev && !getIsLoggedIn(locals)) error(401);
    if (!dev && !getIsAdmin(locals)) error(403);

    const { userEmail, transaction }: { userEmail: string, transaction: LoyaltyProgramPointsTransaction } = await request.json();
    const exists = await checkUserByEmail(userEmail);
    if (!exists) error(400);
    await addPointsTransaction(transaction, userEmail);
    return text('ok');
};