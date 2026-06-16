import { type IRID, type NSPID } from '$lib/helpers/ir';
import { derived, readable, type Readable } from 'svelte/store';
import { getStoreNSP, getStoreIR } from '$lib/client/incrementalUpdates';
import type { IR, NSP } from '$lib/data';
import db from '$lib/client/db';

export const getData = async (id: {
    irid: IRID | null;
    nspids: NSPID[];
}): Promise<{
    irid: IRID | null, nspids: NSPID[],
    ir: IR | null, nsps: NSP[],
    success: boolean,
}> => {
    const base = { ...id, ir: null, nsps: [], success: false };

    try {
        if (id.irid) {
            const ir = await db.getIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir, success: true };
        } else if (id.nspids) {
            const data = await id.nspids.map(db.getNSP).awaitAll();
            const defined = data.filterNotUndefined();
            const anyNotDeleted = defined.some(p => !p.deleted);
            const nsps = anyNotDeleted ? defined.filter(p => !p.deleted) : defined;
            return { ...base, nsps, success: true };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const getDataAsStore = (id: {
    irid: IRID | null;
    nspids: NSPID[]
}): {
    irid: IRID | null, nspids: NSPID[],
    ir: Readable<IR | null | 'loading'>, nsps: Readable<NSP[] | 'loading'>,
} => {
    const base = { ...id, ir: readable(null), nsps: readable([]) };

    try {
        if (id.irid) {
            const ir = getStoreIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir };
        } else if (id.nspids) {
            const nsps = derived(
                id.nspids.map(getStoreNSP),
                data => {
                    if (data.some(p => p == 'loading')) return 'loading';
                    return data.map(p => p == 'loading' ? undefined : p).filterNotUndefined()
                        .sort((a, b) => (a.deleted ? 1 : 0) - (b.deleted ? 1 : 0));
                },
            );
            return { ...base, nsps };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};