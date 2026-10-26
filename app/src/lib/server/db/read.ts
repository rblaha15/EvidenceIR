import type { ReadDatabase } from '$lib/client/db/def';
import type { ExistingNSP } from '$lib/data';
import { getIsRegulusOrAdmin } from '$lib/server/auth';
import { id, irCollection, nspCollection } from '$lib/server/db';

export type ReadDatabaseWithLocals = {
    [F in keyof ReadDatabase]: ((locals: App.Locals, ...args: [...Parameters<ReadDatabase[F]>]) => ReturnType<ReadDatabase[F]>)
}

export const mongoReadDatabase: ReadDatabaseWithLocals = {
    getIR: (_, irid) => irCollection.findOne(id(irid)),
    getChangedIRs: async (locals, lastUpdatedAt) => {
        const user = locals.user!;
        const cursor = getIsRegulusOrAdmin(locals) ? irCollection.find({
            'meta.changedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user.email,
            'meta.changedAt': { $gt: lastUpdatedAt },
        });
        return await cursor.toArray();
    },
    existsIR: (_, irid) => irCollection.findOne(id(irid)).then(doc => doc != null),

    getNSP: (_, nspid) => nspCollection.findOne(id(nspid)),
    getChangedNSPs: async (_, lastUpdatedAt) => await nspCollection.find({
        'meta.changedAt': { $gt: lastUpdatedAt },
    }).toArray() as ExistingNSP[],
};