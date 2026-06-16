import { getAll, id, irCollection, nspCollection } from "$lib/server/db";
import type { IRID } from "$lib/helpers/ir";

export const getAllIRs = () => getAll(irCollection.find());
export const getAllNSPs = () => getAll(nspCollection.find());
export const restoreIR = (irid: IRID) => irCollection.updateOne(id(irid), {
    $set: {
        deleted: false,
        'meta.deletedAt': undefined,
        'meta.movedTo': undefined,
        'meta.changedAt': new Date(),
    },
});
export const deletePermanentlyIR = (irid: IRID) => irCollection.deleteOne(id(irid));