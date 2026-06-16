import '$lib/extensions'
import { type FindCursor, MongoClient } from "mongodb";
import { MONGO_URI } from "$env/static/private";
import type { IR, NSP, RecommendationData } from "$lib/data";
import type { IRID, NSPID } from "$lib/helpers/ir";
import type { DocumentSigningInfo } from "$lib/server/signing";

export const client = new MongoClient(MONGO_URI);

const db = client.db('app');

export const irCollection = db.collection<IR>('ir');
export const nspCollection = db.collection<NSP>('nsp');
export const rkCollection = db.collection<RecommendationData & { _id?: string }>('rk');
export const signingCollection = db.collection<DocumentSigningInfo>('signing');

export const getAll = async <T>(cursor: FindCursor<T>) => {
    const results: T[] = [];
    for await (const doc of cursor) results.push(doc?.also(console.log) as T);
    return results;
}

export const id = <ID extends IRID | NSPID>(id: ID) => ({ 'meta.id': id })
