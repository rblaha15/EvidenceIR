import { getAll, id, irCollection, nspCollection } from "$lib/server/db";
import type { DeletedIR, DeletedNSP, ExistingIR, ExistingNSP, IR } from "$lib/data";
import { get } from "svelte/store";
import { checkRegulusOrAdmin, currentUser } from "$lib/client/auth";
import type { ReadDatabase } from "$lib/client/db/def";

export const mongoReadDatabase: ReadDatabase = {
    getIR: irid => irCollection.findOne(id(irid)).thenAlso(ir => {
        console.log(ir);
    }),
    getChangedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const cursor = /*await checkRegulusOrAdmin()*/true ? irCollection.find({
            deleted: false,
            'meta.changedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user?.email ?? '',
            deleted: false,
            'meta.changedAt': { $gt: lastUpdatedAt },
        });
        return (await getAll(cursor) as ExistingIR[]).also(console.log);
    },
    getDeletedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const cursor = /*await checkRegulusOrAdmin()*/true ? irCollection.find({
            deleted: true,
            'meta.deletedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user?.email ?? '',
            deleted: true,
            'meta.deletedAt': { $gt: lastUpdatedAt },
        });
        return await getAll(cursor) as DeletedIR[];
    },
    existsIR: irid => irCollection.findOne(id(irid)).then(doc => doc != null),

    getNSP: nspid => nspCollection.findOne(id(nspid)),
    getChangedNSPs: async lastUpdatedAt => await getAll(nspCollection.find({
        deleted: false,
        'meta.changedAt': { $gt: lastUpdatedAt },
    })) as ExistingNSP[],
    getDeletedNSPs: async lastUpdatedAt => await getAll(nspCollection.find({
        deleted: true,
        'meta.deletedAt': { $gt: lastUpdatedAt },
    })) as DeletedNSP[],
};