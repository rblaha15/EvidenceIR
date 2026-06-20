import { deleteIR, deleteNSP, type IR, type NSP } from "$lib/data";
import { client, id, irCollection, nspCollection } from "$lib/server/db";
import { mongoReadDatabase } from "./read";
import { extractIDFromSPOrSZ, type IRID, type NSPID } from "$lib/helpers/ir";
import type { ReadDatabase, WriteDatabase } from '$lib/client/db/def';
import type { MatchKeysAndValues } from "mongodb";

const addCreationTime = <T extends IR | NSP>(data: T): T => ({
    ...data,
    meta: {
        ...data.meta,
        createdAt: new Date().valueOf(),
        changedAt: new Date().valueOf(),
    },
});

const addChangeTime = <T extends IR | NSP>(data: MatchKeysAndValues<T>): MatchKeysAndValues<T> => ({
    ...data,
    'meta.changedAt': new Date().valueOf(),
});

const update = async (irid: IRID, update: MatchKeysAndValues<IR>) => {
    await irCollection.updateOne(id(irid), { $set: update as IR });
}

const updateNSP = async (nspid: NSPID, update: MatchKeysAndValues<NSP>) => {
    await nspCollection.updateOne(id(nspid), { $set: update as NSP });
}

export type WriteDatabaseWIthLocals = {
    [F in keyof WriteDatabase]: ((...args: [...Parameters<WriteDatabase[F]>, locals: App.Locals]) => ReturnType<WriteDatabase[F]>)
}

export const mongoWriteDatabase: WriteDatabaseWIthLocals = {
    addIR: async (ir, locals) => {
        if (await mongoReadDatabase.existsIR(ir.meta.id, locals)) throw new Error(`IR ${ir.meta.id} already exists`);
        await irCollection.insertOne(addCreationTime(ir));
    },
    deleteIR: async (irid, locals) => {
        const ir = await mongoReadDatabase.getIR(irid, locals);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        await update(irid, deleteIR());
    },
    moveIR: async (irid, ir, locals) => {
        if (await mongoReadDatabase.existsIR(ir.meta.id, locals)) throw new Error(`IR ${ir.meta.id} already exists`);
        const session = client.startSession()
        session.startTransaction()
        await irCollection.insertOne(addCreationTime(ir));
        await update(irid, deleteIR(ir.meta.id));
        await session.commitTransaction();
        await session.endSession();
    },
    updateIN: (irid, rawData, isDraft) => update(irid, addChangeTime<IR>({ IN: rawData, isDraft })),
    addRKT: (irid, pump, year, check) => update(irid, addChangeTime<IR>({ [`RK.TC.${pump}.${year}`]: check })),
    addRKS: (irid, year, check) => update(irid, addChangeTime<IR>({ [`RK.SOL.${year}`]: check })),
    addSPs: async (irid, protocols, locals) => {
        const ir = await mongoReadDatabase.getIR(irid, locals);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        await update(irid, addChangeTime<IR>({
            SPs: { ...protocols.associateBy(extractIDFromSPOrSZ), ...ir.SPs }
                .entries().sortedBy(([_, p]) => new Date(p.zasah.datum)).toRecord(),
        }));
    },
    updateSP: async (irid, protocol, locals) => {
        const ir = await mongoReadDatabase.getIR(irid, locals);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        await update(irid, addChangeTime<IR>({
            SPs: { ...ir.SPs, [extractIDFromSPOrSZ(protocol)]: protocol },
        }));
    },
    deleteSP: async (irid, spid, locals) => {
        const ir = await mongoReadDatabase.getIR(irid, locals);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        await update(irid, addChangeTime<IR>({
            SPs: ir.SPs.omit(spid),
        }));
    },
    updateUPT: (irid, protocol) => update(irid, addChangeTime<IR>({ 'UP.TC': protocol })),
    updateDateUPT: async (irid, date) => update(irid, addChangeTime<IR>({ 'UP.dateTC': date })),
    addUPS: async (irid, protocol) => update(irid, addChangeTime<IR>({ 'UP.SOL': protocol })),
    updateDateUPS: async (irid, date) => update(irid, addChangeTime<IR>({ 'UP.dateSOL': date })),
    addUPF: async (irid, protocol) => update(irid, addChangeTime<IR>({ 'UP.FVE': protocol })),
    addFT: async (irid, faceTable) => update(irid, addChangeTime<IR>({ FT: faceTable })),
    updateUsersWithAccessToIR: async (irid, users) => update(irid, addChangeTime<IR>({ 'meta.usersWithAccess': users })),
    markRefsiteConfirmed: async irid => update(irid, addChangeTime<IR>({ 'meta.flags.confirmedRefsite': true })),
    updateDKT: async (irid, enabled, executingCompany) => {
        const ir = await irCollection.findOne(id(irid));
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        const dk = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.TC ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await update(irid, addChangeTime<IR>({ 'RK.DK.TC': dk }));
    },
    updateDKS: async (irid, enabled, executingCompany) => {
        const ir = await irCollection.findOne(id(irid));
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        const dk = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.SOL ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await update(irid, addChangeTime<IR>({ 'RK.DK.SO': dk }));
    },
    addNSP: async (nsp, locals) => {
        if (await mongoReadDatabase.getNSP(nsp.meta.id, locals)) throw new Error(`NSP ${nsp.meta.id} already exists`);
        await nspCollection.insertOne(addCreationTime(nsp));
    },
    updateNSP: (nspid, protocol) =>
        updateNSP(nspid, addChangeTime<NSP>({ NSP: protocol, deleted: false })),
    deleteNSP: nspid => updateNSP(nspid, deleteNSP()),
};
