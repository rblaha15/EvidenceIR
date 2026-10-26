import { isWriteFunctionIR, type WriteDatabase } from '$lib/client/db/def';
import { updates } from '$lib/client/db/performChange';
import { deletedIR, type IR, type NSP } from '$lib/data';
import { nowISO } from '$lib/helpers/date';
import { type IRID, type NSPID } from '$lib/helpers/ir';
import { client, id, irCollection, nspCollection } from '$lib/server/db';
import { mongoReadDatabase } from './read';

const withCreationTime = <T extends IR | NSP>(data: T): T => ({
    ...data,
    meta: {
        ...data.meta,
        createdAt: new Date().valueOf(),
        changedAt: new Date().valueOf(),
    },
});

const withChangeTime = <T extends IR | NSP>(data: T): T => ({
    ...data,
    meta: {
        ...data.meta,
        changedAt: new Date().valueOf(),
    },
});

const replace = async (irid: IRID, newIR: IR & { _id?: unknown }) => {
    const { _id, ...replacement } = newIR;
    await irCollection.replaceOne(id(irid), replacement);
};

const replaceNSP = async (nspid: NSPID, newNSP: NSP & { _id?: unknown }) => {
    const { _id, ...replacement } = newNSP;
    await nspCollection.replaceOne(id(nspid), replacement);
};

export type WriteDatabaseWithLocals = {
    [F in keyof WriteDatabase]: ((...args: [locals: App.Locals, ...Parameters<WriteDatabase[F]>]) => ReturnType<WriteDatabase[F]>)
}

const simpleUpdates = updates.keys().associateWith(name => isWriteFunctionIR(name)
    ? async (...[locals, irid, ...args]: Parameters<WriteDatabaseWithLocals[typeof name]>) => {
        const updateFunction = updates[name];

        const oldIR = await mongoReadDatabase.getIR(locals, irid);
        if (!oldIR) throw new Error(`IR ${irid} doesn't exists`);

        // @ts-expect-error TS doesn't know it's a tuple
        const newIR = updateFunction(oldIR, ...args);
        await replace(irid, withChangeTime(newIR));
    }
    : async (...[locals, nspid, ...args]: Parameters<WriteDatabaseWithLocals[typeof name]>) => {
        const updateFunction = updates[name];

        const oldNSP = await mongoReadDatabase.getNSP(locals, nspid);
        if (!oldNSP) throw new Error(`NSP ${nspid} doesn't exists`);

        // @ts-expect-error TS doesn't know it's a tuple
        const newNSP = updateFunction(oldNSP, ...args);
        await replaceNSP(nspid, withChangeTime(newNSP));
    }
) as Pick<WriteDatabaseWithLocals, keyof typeof updates>;

export const mongoWriteDatabase: WriteDatabaseWithLocals = {
    ...simpleUpdates,
    addIR: async (locals, ir) => {
        if (await mongoReadDatabase.existsIR(locals, ir.meta.id)) throw new Error(`IR ${ir.meta.id} already exists`);
        await irCollection.insertOne(withCreationTime(ir));
    },
    moveIR: async (locals, oldIRID, newIR) => {
        if (await mongoReadDatabase.existsIR(locals, newIR.meta.id)) throw new Error(`IR ${newIR.meta.id} already exists`);

        const oldIR = await mongoReadDatabase.getIR(locals, oldIRID);
        if (!oldIR) throw new Error(`IR ${oldIRID} doesn't exists`);

        const session = client.startSession();
        session.startTransaction();
        await irCollection.insertOne(withCreationTime(newIR));
        await replace(oldIRID, deletedIR(oldIR, newIR.meta.id));
        await session.commitTransaction();
        await session.endSession();
    },
    updateUPT: async (locals, irid, protocol) => {
        const oldIR = await mongoReadDatabase.getIR(locals, irid);
        if (!oldIR) throw new Error(`IR ${irid} doesn't exists`);

        const newIR = updates.updateUPT(oldIR, protocol);
        if (!oldIR.UP.TC?.os) {
            newIR.UP.TC!.uvadeni.createdAt = nowISO(true);
            newIR.UP.TC!.uvadeni.createdBy = locals.user!.email;
        }
        await replace(irid, withChangeTime(newIR));
    },

    addNSP: async (locals, nsp) => {
        if (await mongoReadDatabase.getNSP(locals, nsp.meta.id)) throw new Error(`NSP ${nsp.meta.id} already exists`);
        await nspCollection.insertOne(withCreationTime(nsp));
    },
};
