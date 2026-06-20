import type { IRID } from '$lib/helpers/ir';
import { id, irCollection, nspCollection } from '$lib/server/db';
import type { FindCursor } from 'mongodb';

export const getAllIRs = () => (async <T>(cursor: FindCursor<T>) => cursor.toArray())(irCollection.find());
export const getAllNSPs = () => (async <T>(cursor: FindCursor<T>) => cursor.toArray())(nspCollection.find());
export const restoreIR = (irid: IRID) => irCollection.updateOne(id(irid), {
    $set: {
        deleted: false,
        'meta.deletedAt': undefined,
        'meta.movedTo': undefined,
        'meta.changedAt': new Date(),
    },
});
export const deletePermanentlyIR = (irid: IRID) => irCollection.deleteOne(id(irid));