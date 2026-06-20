import '$lib/extensions'
import type { Session, User } from '$lib/server/auth';
import type { Account } from 'better-auth';
import { MongoClient, type ObjectId } from 'mongodb';
import { MONGO_URI } from "$env/static/private";
import type { IR, NSP, RecommendationData } from "$lib/data";
import type { IRID, NSPID } from "$lib/helpers/ir";
import type { DocumentSigningInfo } from "$lib/server/signing";

export const client = new MongoClient(MONGO_URI);

export const db = client.db('app');

export type WithMongoID<T> = Omit<T, 'id'> & { _id?: ObjectId }
export type WithAuthID<T> = Omit<T, '_id'> & { id: string }

export const irCollection = db.collection<IR>('ir');
export const nspCollection = db.collection<NSP>('nsp');
export const rkCollection = db.collection<RecommendationData & { _id?: string }>('rk');
export const signingCollection = db.collection<DocumentSigningInfo>('signing');
export const accountCollection = db.collection<WithMongoID<Account>>('account');
export const sessionCollection = db.collection<WithMongoID<Session>>('session');
export const userCollection = db.collection<WithMongoID<User>>('user');

export const id = <ID extends IRID | NSPID>(id: ID) => ({ 'meta.id': id })
