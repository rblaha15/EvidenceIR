import type { ReadDatabase } from '$lib/client/db/def';
import type { ExistingNSP } from '$lib/data';
import { getIsRegulusOrAdmin } from '$lib/server/auth';
import { id, irCollection, nspCollection } from '$lib/server/db';

export type ReadDatabaseWIthLocals = {
    [F in keyof ReadDatabase]: ((...args: [...Parameters<ReadDatabase[F]>, locals: App.Locals]) => ReturnType<ReadDatabase[F]>)
}

export const mongoReadDatabase: ReadDatabaseWIthLocals = {
    getIR: irid => irCollection.findOne(id(irid)),
    getChangedIRs: async (lastUpdatedAt, locals) => {
        const user = locals.user!;
        const cursor = getIsRegulusOrAdmin(locals) ? irCollection.find({
            'meta.changedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user.email,
            'meta.changedAt': { $gt: lastUpdatedAt },
        });
        return await cursor.toArray();
    },
    existsIR: irid => irCollection.findOne(id(irid)).then(doc => doc != null),

    getNSP: nspid => nspCollection.findOne(id(nspid)),
    getChangedNSPs: async lastUpdatedAt => await nspCollection.find({
        'meta.changedAt': { $gt: lastUpdatedAt },
    }).toArray() as ExistingNSP[],
};