import type { ReadDatabase } from '$lib/client/db/def';
import type { DeletedIR, DeletedNSP, ExistingIR, ExistingNSP } from '$lib/data';
import { getIsRegulusOrAdmin } from '$lib/server/auth';
import { id, irCollection, nspCollection } from '$lib/server/db';

export type ReadDatabaseWIthLocals = {
    [F in keyof ReadDatabase]: ((...args: [...Parameters<ReadDatabase[F]>, locals: App.Locals]) => ReturnType<ReadDatabase[F]>)
}

export const mongoReadDatabase: ReadDatabaseWIthLocals = {
    getIR: irid => irCollection.findOne(id(irid)).thenAlso(ir => {
        console.log(ir);
    }),
    getChangedIRs: async (lastUpdatedAt, locals) => {
        const user = locals.user!;
        const cursor = getIsRegulusOrAdmin(locals) ? irCollection.find({
            deleted: false,
            'meta.changedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user.email,
            deleted: false,
            'meta.changedAt': { $gt: lastUpdatedAt },
        });
        return (await cursor.toArray() as ExistingIR[]).also(console.log);
    },
    getDeletedIRs: async (lastUpdatedAt, locals) => {
        const user = locals.user!;
        const cursor = getIsRegulusOrAdmin(locals) ? irCollection.find({
            deleted: true,
            'meta.deletedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user.email,
            deleted: true,
            'meta.deletedAt': { $gt: lastUpdatedAt },
        });
        return await cursor.toArray() as DeletedIR[];
    },
    existsIR: irid => irCollection.findOne(id(irid)).then(doc => doc != null),

    getNSP: nspid => nspCollection.findOne(id(nspid)),
    getChangedNSPs: async lastUpdatedAt => await nspCollection.find({
        deleted: false,
        'meta.changedAt': { $gt: lastUpdatedAt },
    }).toArray() as ExistingNSP[],
    getDeletedNSPs: async lastUpdatedAt => await nspCollection.find({
        deleted: true,
        'meta.deletedAt': { $gt: lastUpdatedAt },
    }).toArray() as DeletedNSP[],
};