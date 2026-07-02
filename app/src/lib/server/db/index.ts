import '$lib/extensions';
import { MONGO_URI } from '$env/static/private';
import type { StringArray, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationData } from '$lib/data';
import type { IRID, NSPID } from '$lib/helpers/ir';
import type { Session, User } from '$lib/server/auth';
import type { Token } from '$lib/server/db/admin/tokens';
import type { DocumentSigningInfo } from '$lib/server/signing';
import type { Account } from 'better-auth';
import { MongoClient, type ObjectId } from 'mongodb';

export const client = new MongoClient(MONGO_URI);

export const authDB = client.db('auth');
export const appDB = client.db('app');
export const dataDB = client.db('data');

export type WithMongoID<T> = Omit<T, 'id' | 'userID'> & { _id?: ObjectId }
export type WithID<T> = Omit<T, '_id'> & { id: string }
export type WithUserID<T> = Omit<T, '_id'> & { userID: string }

export const irCollection = appDB.collection<IR>('ir');
export const nspCollection = appDB.collection<NSP>('nsp');
export const rkCollection = appDB.collection<RecommendationData & { _id?: string }>('rk');
export const signingCollection = appDB.collection<DocumentSigningInfo>('signing');
export const accountCollection = authDB.collection<WithMongoID<Account>>('account');
export const sessionCollection = authDB.collection<WithMongoID<Session>>('session');
export const userCollection = authDB.collection<WithMongoID<User>>('user');
export const personCollection = dataDB.collection<Person>('person');
export const companyCollection = dataDB.collection<Company>('company');
export const technicianCollection = dataDB.collection<Technician>('technicians');
export const sparePartCollection = dataDB.collection<SparePart>('spareParts');
export const arraysCollection = dataDB.collection<StringArray>('arrays');
export const loyaltyProgramCollection = dataDB.collection<LoyaltyProgramUserData>('loyaltyProgram');
export const tokenCollection = dataDB.collection<Token>('token');

export const id = <ID extends IRID | NSPID>(id: ID) => ({ 'meta.id': id });

await tokenCollection.createIndex('tokenHash', { unique: true });
await tokenCollection.createIndex('expiresAt', { expireAfterSeconds: 0 });