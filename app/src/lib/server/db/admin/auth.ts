import type { Person } from '$lib/client/db/arrays';
import { userCollection } from '$lib/server/db';

export const updateUserNames = (users: Omit<Person, 'id'>[]) =>
    userCollection.bulkWrite(users.map(user => ({
        updateOne: {
            filter: { email: user.email },
            update: {
                $set: {
                    name: user.name,
                },
            },
        },
    })));

export const checkUserByEmail = (email: string) => userCollection
    .findOne({ email: email }, {
        projection: { id: 0 },
    }).then(Boolean);


export const removeUsers = async (preserveEmails: string[]) => userCollection
    .deleteMany({ email: { $nin: preserveEmails } });
