import { userCollection, type WithAuthID } from '$lib/server/db';
import { ObjectId } from 'mongodb';

export const getOrCreateUser = async (
    email: string,
    name: string,
) => {
    const current = await userCollection.findOne({
        email,
    }, {
        projection: {},
    });
    if (current) return { error: 'user-exists' as const, user: { email, id: current._id!.toString() } };

    const result = await userCollection.insertOne({
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        role: 'user',
        banned: true,
    });

    return { user: { email, id: result.insertedId.toString() } };
};

const convertID = <T extends { _id: ObjectId }>({ _id, ...doc }: T): WithAuthID<T> => ({ ...doc, id: _id.toString() });

export const getUsersByIDs = (ids: string[]) => userCollection
    .find({ _id: { $in: ids.map(id => new ObjectId(id)) } })
    .project<{ _id: ObjectId, email: string }>({ email: 1 })
    .map(convertID)
    .toArray();

export const getUsersByEmails = (emails: string[]) => userCollection
    .find({ email: { $in: emails } })
    .project<{ _id: ObjectId, email: string }>({ email: 1 })
    .map(convertID)
    .toArray();

export const getUserByEmail = (email: string) => userCollection
    .findOne<{ _id: ObjectId, email: string, banned: boolean }>({ email: email }, {
        projection: { email: 1, banned: 1 },
    })
    .then(u => u ? convertID(u) : u);

export const removeUsers = async (ids: string[]) => userCollection
    .deleteMany({ _id: { $in: ids.map(id => new ObjectId(id)) } });

export const setUserName = (id: string, name: string) => userCollection
    .updateOne({ _id: new ObjectId(id) }, { $set: { name } });

export const enableUser = async (id: string) => {
    console.log('enabling user', id);
    const r = await userCollection
        .updateOne({ _id: new ObjectId(id) }, { $set: { banned: false } });
    console.log('result', r);
}