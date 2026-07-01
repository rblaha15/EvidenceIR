import type { Arrays, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import {
    arraysCollection,
    companyCollection,
    loyaltyProgramCollection,
    personCollection,
    sparePartCollection,
    technicianCollection,
    type WithID,
    type WithMongoID
} from '$lib/server/db';
import { ObjectId } from 'mongodb';

const convertID = <T extends { _id: ObjectId }>({ _id, ...doc }: T): WithID<T> => ({ ...doc, id: _id.toString() });

export const getArrays = () =>
    arraysCollection.find().toArray().then(all => all.associate(it => [it.name, it.value]));

export const setArrays = (arrays: Record<Arrays, string[]>) => arraysCollection.bulkWrite(
    arrays.mapTo((name, array) => ({
        replaceOne: {
            filter: { name },
            replacement: { name, value: array },
            upsert: true,
        },
    })),
);

export const getSpareParts = () =>
    sparePartCollection.find().project<SparePart>({ _id: 0 }).toArray();

export const setSpareParts = async (spareParts: SparePart[]) => {
    await sparePartCollection.deleteMany({ code: { $nin: spareParts.map(it => it.code) } });
    await sparePartCollection.bulkWrite(spareParts.map(sparePart => ({
        replaceOne: {
            filter: { code: sparePart.code },
            replacement: sparePart,
            upsert: true,
        },
    })));
};

export const getTechnicians = () =>
    technicianCollection.find().project<Technician>({ _id: 0 }).toArray();

export const setTechnicians = async (technicians: Technician[]) => {
    await technicianCollection.deleteMany({ email: { $nin: technicians.map(it => it.email) } });
    await technicianCollection.bulkWrite(technicians.map(technician => ({
        replaceOne: {
            filter: { email: technician.email },
            replacement: technician,
            upsert: true,
        },
    })));
};

export const getCompanies = () =>
    companyCollection.find().project<Company>({ _id: 0 }).toArray();

export const getCompaniesByCRNs = (crns: string[]) => companyCollection
    .find<Company>({ crn: { $in: crns } }).project<Company>({ _id: 0 }).toArray();

export const getCompanyByEmail = (email: string) => companyCollection
    .findOne<Company>({ email }, { projection: { _id: 0 } });

export const setCompanies = async (companies: Company[]) => {
    await companyCollection.deleteMany({ email: { $nin: companies.map(it => it.email) } });
    await companyCollection.bulkWrite(companies.map(company => ({
        replaceOne: {
            filter: { email: company.email },
            replacement: company,
            upsert: true,
        },
    })));
};

export const getPeople = () =>
    personCollection.find().map<Person>(convertID).toArray();

export const getPersonByEmail = (email: string) =>
    personCollection.findOne({ email }).then(p => p ? convertID(p) as Person : p);

export const removePeople = (preserveIDs: string[]) => personCollection
    .deleteMany({ _id: { $nin: preserveIDs.map(id => new ObjectId(id)) } });

export const setPeople = async (people: Person[]) => {
    await personCollection.deleteMany({ email: { $nin: people.map(it => it.email) } });
    await personCollection.bulkWrite(people.map(person => ({
        replaceOne: {
            filter: { email: person.email },
            replacement: person,
            upsert: true,
        },
    })));
};

const convertUserID = ({ _id, ...doc }: WithMongoID<LoyaltyProgramUserData>): LoyaltyProgramUserData =>
    ({ ...doc, userID: _id!.toString() });

export const getAllLoyaltyProgramData = () => loyaltyProgramCollection
    .find()
    .map(convertUserID)
    .toArray()
    .then(res => res.associateBy(it => it.userID));

export const getLoyaltyProgramData = (userID: string) => loyaltyProgramCollection
    .findOne({ _id: new ObjectId(userID) })
    .then(doc => doc ? convertUserID(doc) : { userID, points: 0, history: [] });

export const setLoyaltyProgramData = (userID: string, data: Omit<LoyaltyProgramUserData, 'userID'>) =>
    loyaltyProgramCollection.updateOne(
        { _id: new ObjectId(userID) },
        { $set: { ...data, _id: new ObjectId(userID) } },
        { upsert: true },
    );