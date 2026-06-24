import '$lib/extensions';
import { error, json, type RequestHandler, text } from '@sveltejs/kit';
import { checkAdmin, checkToken, getUserByEmail } from '$lib/server/auth';
import { getAllLoyaltyProgramData, getPeople } from '$lib/server/realtime';
import { dev } from '$app/environment';
import { type LoyaltyProgramPointsTransaction } from '$lib/client/loyaltyProgram';
import { addPointsTransaction } from '$lib/server/loyaltyProgram';

export const GET: RequestHandler = async ({ url }) => {
    const t = url.searchParams.get('token');
    const token = await checkToken(t);
    if (!dev && !token) error(401);
    if (!dev && !await checkAdmin(token!)) error(403);

    const all = await getAllLoyaltyProgramData();
    const users = await getPeople();
    const result = all.mapValues((uid, data) => ({
        email: users[uid]?.email,
        responsiblePerson: users[uid]?.responsiblePerson,
        data,
    }));
    return json(result);
};

export const POST: RequestHandler = async ({ url, request }) => {
    const t = url.searchParams.get('token');
    const token = await checkToken(t);
    if (!dev && !token) error(401);
    if (!dev && !await checkAdmin(token!)) error(403);

    const { userEmail, transaction }: { userEmail: string, transaction: LoyaltyProgramPointsTransaction } = await request.json();
    const user = await getUserByEmail(userEmail);
    await addPointsTransaction(transaction, user.uid);
    return text('ok');
};