import '$lib/extensions';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getAllIRs, getAllSPs } from '$lib/server/firestore';
import { checkAdmin, checkToken } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
    const t = url.searchParams.get('token');
    const token = await checkToken(t);
    if (!token) error(401);
    if (!await checkAdmin(token)) error(403);

    const from = new Date(url.searchParams.get('from') ?? error(400))
    const to = new Date(url.searchParams.get('to') ?? error(400))

    const irs = await getAllIRs();
    const nsps = await getAllSPs();

    const allProtocols = [...irs.flatMap(ir => ir.installationProtocols), ...nsps];

    const namesAndDates = allProtocols.map(p => ({
        name: p.zasah.clovek.trim(),
        initials: p.zasah.inicialy.trim(),
        date: new Date(p.zasah.datum),
    }))

    const filtered = namesAndDates.filter(p =>
        from <= p.date && p.date < to
    )

    const counts = filtered.groupBy(p => `${p.name} (${p.initials})`)
        .mapValues((_, ps) => ps.length)
        .entries()
        .toSorted(([_, a], [__, b]) => b - a)
        .toRecord()

    return json(counts);
};