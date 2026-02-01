import { type IRID, isSPDeleted, type SPID } from '$lib/helpers/ir';
import { derived, readable, type Readable } from 'svelte/store';
import db, { type Deleted, type IR } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { getStoreIndependentProtocol, getStoreIR } from '$lib/client/incrementalUpdates';

export const getData = async (id: {
    irid: IRID | null;
    spids: SPID[];
}): Promise<{
    irid: IRID | null, spids: SPID[],
    ir: IR | Deleted<IRID> | undefined, sps: (Raw<FormNSP> | Deleted<SPID>)[],
    success: boolean,
}> => {
    const base = { ...id, ir: undefined, sps: [], success: false };

    try {
        if (id.irid) {
            const ir = await db.getIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir, success: true };
        } else if (id.spids) {
            const data = await id.spids.map(db.getIndependentProtocol).awaitAll();
            const defined = data.filterNotUndefined();
            const anyNotDeleted = defined.some(p => !isSPDeleted(p));
            const sps = anyNotDeleted ? defined.filter(p => !isSPDeleted(p)) : defined;
            return { ...base, sps, success: true };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const getDataAsStore = (id: {
    irid: IRID | null;
    spids: SPID[]
}): {
    irid: IRID | null, spids: SPID[],
    ir: Readable<IR | Deleted<IRID> | undefined | 'loading'>, sps: Readable<(Raw<FormNSP> | Deleted<SPID>)[] | 'loading'>,
} => {
    const base = { ...id, ir: readable(undefined), sps: readable([]) };

    try {
        if (id.irid) {
            const ir = getStoreIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir };
        } else if (id.spids) {
            const sps = derived(
                id.spids.map(getStoreIndependentProtocol),
                data => {
                    if (data.some(p => p == 'loading')) return 'loading';
                    return data.map(p => p == 'loading' ? undefined : p).filterNotUndefined()
                        .sort((a, b) => (isSPDeleted(a) ? 1 : 0) - (isSPDeleted(b) ? 1 : 0));
                },
            );
            return { ...base, sps };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};