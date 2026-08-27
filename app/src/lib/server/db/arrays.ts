import type { Arrays, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import {
    arraysCollection,
    companyCollection,
    loyaltyProgramCollection,
    personCollection,
    sparePartCollection,
    technicianCollection,
} from '$lib/server/db';

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

export const getCompanyByCRN = (crn: string) => companyCollection
    .findOne<Company>({ crn }, { projection: { _id: 0 } });

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
    personCollection.find().project<Person>({ _id: 0 }).toArray();

export const getPersonByEmail = (email: string) =>
    personCollection.findOne({ email }, { projection: { _id: 0 } });

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
export const addPerson = async (person: Person) => {
    await personCollection.insertOne(person);
};

export const getAllLoyaltyProgramData = () => loyaltyProgramCollection
    .find()
    .project<LoyaltyProgramUserData>({ _id: 0 })
    .toArray()
    .then(res => res.associateBy(it => it.email));

export const getLoyaltyProgramData = (email: string) => loyaltyProgramCollection
    .findOne<LoyaltyProgramUserData>({ email }, { projection: { _id: 0 } })
    .then(doc => doc ?? { email, points: 0, history: [] });

export const setLoyaltyProgramData = (data: LoyaltyProgramUserData) =>
    loyaltyProgramCollection.updateOne(
        { email: data.email },
        { $set: data },
        { upsert: true },
    );