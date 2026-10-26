import { isWriteFunctionIR, type WriteDatabase } from '$lib/client/db/def';
import { updates } from '$lib/client/db/performChange';
import { deletedIR, type IR, type NSP } from '$lib/data';
import { removeSignaturesFromData } from '$lib/features/signing/actions/changes';
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

type Context = { locals: App.Locals, fetch: typeof window.fetch };

export type WriteDatabaseWithContext = {
    [F in keyof WriteDatabase]: ((...args: [ctx: Context, ...Parameters<WriteDatabase[F]>]) => ReturnType<WriteDatabase[F]>)
}

const simpleUpdates = updates.keys().associateWith(name =>
    async (...[{ locals, fetch }, id, ...args]: Parameters<WriteDatabaseWithContext[typeof name]>) => {
        const updateFunction = updates[name];

        const oldData = isWriteFunctionIR(name)
            ? await mongoReadDatabase.getIR(locals, id as IRID)
            : await mongoReadDatabase.getNSP(locals, id as NSPID);
        if (!oldData) throw new Error(isWriteFunctionIR(name) ? `IR ${id} doesn't exists` : `NSP ${id} doesn't exists`);

        // @ts-expect-error TS doesn't know it's a tuple
        const newData = updateFunction(oldData, ...args);
        const withoutSignatures = oldData.deleted || newData.deleted ? newData
            : await removeSignaturesFromData(oldData, newData, fetch);
        isWriteFunctionIR(name)
            ? await replace(id as IRID, withChangeTime(withoutSignatures as IR))
            : await replaceNSP(id as NSPID, withChangeTime(withoutSignatures as NSP))
    }
) as Pick<WriteDatabaseWithContext, keyof typeof updates>;

export const mongoWriteDatabase: WriteDatabaseWithContext = {
    ...simpleUpdates,
    addIR: async ({ locals }, ir) => {
        if (await mongoReadDatabase.existsIR(locals, ir.meta.id)) throw new Error(`IR ${ir.meta.id} already exists`);
        await irCollection.insertOne(withCreationTime(ir));
    },
    moveIR: async ({ locals, fetch }, oldIRID, newIR) => {
        const newIRID = newIR.meta.id;
        if (await mongoReadDatabase.existsIR(locals, newIRID)) throw new Error(`IR ${newIRID} already exists`);

        const oldIR = await mongoReadDatabase.getIR(locals, oldIRID);
        if (!oldIR) throw new Error(`IR ${oldIRID} doesn't exists`);

        const withoutSignatures = oldIR.deleted || newIR.deleted ? newIR
            : await removeSignaturesFromData<'IR'>(oldIR, newIR, fetch);

        const session = client.startSession();
        session.startTransaction();
        await irCollection.insertOne(withCreationTime(withoutSignatures));
        await replace(oldIRID, deletedIR(oldIR, newIRID));
        await session.commitTransaction();
        await session.endSession();
    },
    updateUPT: async ({ locals, fetch }, irid, protocol) => {
        const oldIR = await mongoReadDatabase.getIR(locals, irid);
        if (!oldIR) throw new Error(`IR ${irid} doesn't exists`);

        const newIR = updates.updateUPT(oldIR, protocol);
        if (!oldIR.UP.TC?.os) {
            newIR.UP.TC!.uvadeni.createdAt = nowISO(true);
            newIR.UP.TC!.uvadeni.createdBy = locals.user!.email;
        }
        const withoutSignatures = oldIR.deleted || newIR.deleted ? newIR
            : await removeSignaturesFromData<'IR'>(oldIR, newIR, fetch);
        await replace(irid, withChangeTime(withoutSignatures));
    },

    addNSP: async ({ locals }, nsp) => {
        if (await mongoReadDatabase.getNSP(locals, nsp.meta.id)) throw new Error(`NSP ${nsp.meta.id} already exists`);
        await nspCollection.insertOne(withCreationTime(nsp));
    },
};
