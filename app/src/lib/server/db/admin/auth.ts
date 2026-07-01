import type { Person } from '$lib/client/db/arrays';
import { userCollection, type WithID } from '$lib/server/db';
import { ObjectId } from 'mongodb';

export const updateUserNamesOrCreateNew = (users: Omit<Person, 'id'>[]) =>
    userCollection.bulkWrite(users.map(user => ({
        updateOne: {
            filter: { email: user.email },
            update: {
                $setOnInsert: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    emailVerified: false,
                    role: 'user',
                    banned: true,
                },
                $set: {
                    name: user.name,
                },
            },
            upsert: true,
        },
    }))).then(result => {
        const upsertedIds = result.upsertedIds as Record<string, ObjectId>;
        return upsertedIds.mapTo((i, id) =>
            ({ email: users[i.toNumber()].email, id: id.toString() }),
        );
    });

const convertID = <T extends { _id: ObjectId }>({ _id, ...doc }: T): WithID<T> => ({ ...doc, id: _id.toString() });

export const getUsersByIDs = (ids: string[]) => userCollection
    .find({ _id: { $in: ids.map(id => new ObjectId(id)) } })
    .project<{ _id: ObjectId, email: string }>({ email: 1 })
    .map(convertID)
    .toArray();

export const getUserByEmail = (email: string) => userCollection
    .findOne<{ _id: ObjectId, email: string, banned: boolean }>({ email: email }, {
        projection: { email: 1, banned: 1 },
    })
    .then(u => u ? convertID(u) : u);

export const getUserIDsByEmails = (emails: string[]) => userCollection
    .find({ email: { $in: emails } })
    .project<{ _id: ObjectId, email: string }>({ email: 1 })
    .map(convertID)
    .toArray();

export const removeUsers = async (preserveIDs: string[]) => userCollection
    .deleteMany({ _id: { $nin: preserveIDs.map(id => new ObjectId(id)) } });

export const enableUser = async (id: string) => {
    console.log('enabling user', id);
    const r = await userCollection
        .updateOne({ _id: new ObjectId(id) }, { $set: { banned: false } });
    console.log('result', r);
};