import '$lib/extensions';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getAllIRs, getAllSPs } from '$lib/server/firestore';
import { checkAdmin, checkToken, getUsersByID } from '$lib/server/auth';
import { getAllLoyaltyProgramData } from '$lib/server/realtime';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ url }) => {
    const t = url.searchParams.get('token');
    const token = await checkToken(t);
    if (!dev && !token) error(401);
    if (!dev && !await checkAdmin(token!)) error(403);
    const type = url.searchParams.get('type') as 'protocols' | 'loyalty';

    if (type == 'protocols') {
        const from = new Date(url.searchParams.get('from') ?? error(400));
        const to = new Date(url.searchParams.get('to') ?? error(400));

        const irs = await getAllIRs();
        const nsps = await getAllSPs();

        const allProtocols = [...irs.flatMap(ir => ir.installationProtocols), ...nsps];

        const namesAndDates = allProtocols.map(p => ({
            name: p.zasah.clovek.trim(),
            initials: p.zasah.inicialy.trim(),
            date: new Date(p.zasah.datum),
        }));

        const filtered = namesAndDates.filter(p =>
            from <= p.date && p.date < to,
        );

        const counts = filtered.groupBy(p => `${p.name} (${p.initials})`)
            .mapValues((_, ps) => ps.length)
            .entries()
            .toSorted(([_, a], [__, b]) => b - a)
            .toRecord();

        return json(counts);
    } else if (type == 'loyalty') {
        const all = await getAllLoyaltyProgramData();
        const uids = all.keys();
        const users = (await getUsersByID(uids)).flatMap(r => r.users);
        const emails = users.associate(u => [u.uid, u.email!]);
        const result = all.mapEntries((uid, d) => [emails[uid] || uid, d]);
        return json(result);
    }

    return error(400);
};