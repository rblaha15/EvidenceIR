import type { ReadDatabase } from '$lib/client/db/def';
import type { ExistingNSP, IR } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { BaseFormSZ } from '$lib/forms/SP/formSZ';
import { isSP } from '$lib/helpers/ir';

import { getIsRegulusOrAdmin } from '$lib/server/auth';
import { id, irCollection, nspCollection } from '$lib/server/db';

export type ReadDatabaseWIthLocals = {
    [F in keyof ReadDatabase]: ((...args: [...Parameters<ReadDatabase[F]>, locals: App.Locals]) => ReturnType<ReadDatabase[F]>)
}

const stripServiceProtocolsFromIRs = (locals: App.Locals) => (irs: IR[]): IR[] =>
    irs.mapNotUndefined(stripServiceProtocols(locals));

const stripServiceProtocols = (locals: App.Locals) => (ir: IR | null): IR | null => ir == null ? null : {
    ...ir,
    SPs: ir.SPs.mapValues((_, protocol) =>
        getIsRegulusOrAdmin(locals) || !isSP(protocol) ? protocol
            : stripServiceProtocol(protocol),
    ),
};
const stripServiceProtocol = (protocol: Raw<FormSP>): Raw<BaseFormSZ> => ({
    zasah: {
        datum: protocol.zasah.datum,
        clovek: protocol.zasah.clovek,
        popis: protocol.zasah.popis,
    },
});

export const mongoReadDatabase: ReadDatabaseWIthLocals = {
    getIR: (irid, locals) => irCollection.findOne(id(irid))
        .then(stripServiceProtocols(locals)),
    getChangedIRs: async (lastUpdatedAt, locals) => {
        const user = locals.user!;
        const cursor = getIsRegulusOrAdmin(locals) ? irCollection.find({
            'meta.changedAt': { $gt: lastUpdatedAt },
        }) : irCollection.find({
            'meta.usersWithAccess': user.email,
            'meta.changedAt': { $gt: lastUpdatedAt },
        });
        return await cursor.toArray().then(stripServiceProtocolsFromIRs(locals));
    },
    existsIR: irid => irCollection.findOne(id(irid)).then(doc => doc != null),

    getNSP: nspid => nspCollection.findOne(id(nspid)),
    getChangedNSPs: async lastUpdatedAt => await nspCollection.find({
        'meta.changedAt': { $gt: lastUpdatedAt },
    }).toArray() as ExistingNSP[],
};