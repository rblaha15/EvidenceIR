import type { Person } from '$lib/client/db/arrays';
import type { User } from '$lib/server/auth';
import { userCollection } from '$lib/server/db';
import { ObjectId } from 'mongodb';

export const updateUserLastSeen = (user: User) => userCollection.updateOne(
    { _id: new ObjectId(user.id) },
    { $set: { lastSeenAt: new Date() } }
);

export const updateUserNames = (users: Person[]) =>
    userCollection.bulkWrite(users.map(user => ({
        updateOne: {
            filter: { email: user.email },
            update: {
                $set: { name: user.name },
            },
        },
    })));

export const checkUserByEmail = (email: string) => userCollection
    .findOne({ email: email }, {
        projection: { id: 0 },
    }).then(Boolean);


export const removeUsers = async (preserveEmails: string[]) => userCollection
    .deleteMany({ email: { $nin: preserveEmails } });

export const getUserActivity = () =>
    userCollection.find().project<{
        createdAt: string, lastSeenAt?: string | null, email: string, name: string,
    }>({ createdAt: 1, lastSeenAt: 1, email: 1, name: 1, _id: 0 }).toArray();