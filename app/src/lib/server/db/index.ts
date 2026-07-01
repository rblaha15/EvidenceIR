import '$lib/extensions';
import { MONGO_URI } from '$env/static/private';
import type { StringArray, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationData } from '$lib/data';
import type { IRID, NSPID } from '$lib/helpers/ir';
import type { Session, User } from '$lib/server/auth';
import type { DocumentSigningInfo } from '$lib/server/signing';
import type { Account } from 'better-auth';
import { MongoClient, type ObjectId } from 'mongodb';

export const client = new MongoClient(MONGO_URI);

export const db = client.db('app');

export type WithMongoID<T> = Omit<T, 'id' | 'userID'> & { _id?: ObjectId }
export type WithID<T> = Omit<T, '_id'> & { id: string }
export type WithUserID<T> = Omit<T, '_id'> & { userID: string }

export const irCollection = db.collection<IR>('ir');
export const nspCollection = db.collection<NSP>('nsp');
export const rkCollection = db.collection<RecommendationData & { _id?: string }>('rk');
export const signingCollection = db.collection<DocumentSigningInfo>('signing');
export const accountCollection = db.collection<WithMongoID<Account>>('account');
export const sessionCollection = db.collection<WithMongoID<Session>>('session');
export const userCollection = db.collection<WithMongoID<User>>('user');
export const personCollection = db.collection<WithMongoID<Person>>('person');
export const companyCollection = db.collection<Company>('company');
export const technicianCollection = db.collection<Technician>('technicians');
export const sparePartCollection = db.collection<SparePart>('spareParts');
export const arraysCollection = db.collection<StringArray>('arrays');
export const loyaltyProgramCollection = db.collection<WithMongoID<LoyaltyProgramUserData>>('loyaltyProgram');

export const id = <ID extends IRID | NSPID>(id: ID) => ({ 'meta.id': id });
