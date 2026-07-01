import '$lib/extensions';
import { getUserByEmail, getUsersByIDs } from '$lib/server/db/admin/auth';
import { error, json, type RequestHandler, text } from '@sveltejs/kit';
import { getIsAdmin, getIsLoggedIn } from '$lib/server/auth';
import { getAllLoyaltyProgramData } from '$lib/server/db/arrays';
import { dev } from '$app/environment';
import { type LoyaltyProgramPointsTransaction } from '$lib/client/loyaltyProgram';
import { addPointsTransaction } from '$lib/server/loyaltyProgram';

export const GET: RequestHandler = async ({ locals }) => {
    if (!dev && !getIsLoggedIn(locals)) error(401);
    if (!dev && !getIsAdmin(locals)) error(403);

    const all = await getAllLoyaltyProgramData();
    const ids = all.keys();
    const users = await getUsersByIDs(ids);
    const emails = users.associate(u => [u.id, u.email]);
    const result = all.mapValues((uid, data) => ({ email: emails[uid], data }));
    return json(result);
};

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!dev && !getIsLoggedIn(locals)) error(401);
    if (!dev && !getIsAdmin(locals)) error(403);

    const { userEmail, transaction }: { userEmail: string, transaction: LoyaltyProgramPointsTransaction } = await request.json();
    const user = await getUserByEmail(userEmail);
    if (!user) error(400);
    await addPointsTransaction(transaction, user.id);
    return text('ok');
};