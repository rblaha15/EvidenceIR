import '$lib/extensions';
import type { UpdateDataEndpoints } from '$lib/client/updateDataEndpoints';
import {
    getIsAdmin,
    getIsLoggedIn,
    type User
} from '$lib/server/auth';
import { getOrCreateUser, getUserByEmail, getUsersByEmails, removeUsers, setUserName } from '$lib/server/db/admin/auth';
import { processLoyaltyReward } from '$lib/server/loyaltyProgram';
import {
    getPeople,
    removePerson,
    setArray,
    setCompanies,
    setPersonDetails,
    setSpareParts,
    setTechnicians,
} from '$lib/server/realtime';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type Params = {
    [T in keyof UpdateDataEndpoints]: UpdateDataEndpoints[T] & { type: T }
}[keyof UpdateDataEndpoints];

export const POST: RequestHandler = async ({ request, locals }) => {
    const args = await request.json() as Params;
    const { type } = args;
    if (!getIsLoggedIn(locals)) error(401, 'Unauthorized');

    if (type == 'users') {
        if (!getIsAdmin(locals)) error(401, 'Unauthorized');
        const oldPeople = (await getPeople()).mapTo((_, p) => p.email);
        const newPeople = args.array;

        const toRemove = oldPeople.filter(p => !newPeople.some(p2 => p2.email == p));
        const toAdd = newPeople.filter(p => !oldPeople.some(p2 => p2 == p.email));
        const toChange = newPeople.map(p => p.email).filter(p => oldPeople.some(p2 => p2 == p));

        const usersToDelete = await getUsersByEmails(toRemove);

        await usersToDelete.map(u => {
            console.log(`Removing ${u.email}`);
            return removePerson(u.id);
        }).awaitAll();
        await removeUsers(usersToDelete.map(u => u.id));

        const usersToChange = [
            ...await toAdd.map(async p => {
                console.log(`Creating ${p.email}`);
                const result = await getOrCreateUser(p.email, p.name)
                if (result.error == 'user-exists')
                    console.log(`Already exists: ${p.email}`);
                return result.user;
            }).awaitAll(),
            ...await getUsersByEmails(toChange),
        ];

        await usersToChange.map(async u => {
            const d = newPeople.find(p => p.email.toLowerCase() == u.email?.toLowerCase())!;
            console.log(`Editing ${u.email}: ${JSON.stringify(d)}`);
            await setUserName(u.id, d.name);
            // await setPersonDetails(u.id, d); TODO
        }).awaitAll();
    } else if (type == 'companies') {
        if (!getIsAdmin(locals)) error(401, 'Unauthorized');
        await setCompanies(args.array);
    } else if (type == 'technicians') {
        if (!getIsAdmin(locals)) error(401, 'Unauthorized');
        await setTechnicians(args.array);
    } else if (type == 'spareParts') {
        if (!getIsAdmin(locals)) error(401, 'Unauthorized');
        await setSpareParts(args.array);
    } else if (type == 'arrays') {
        if (!getIsAdmin(locals)) error(401, 'Unauthorized');
        const { arrays } = args;
        await setArray('accumulationTanks', arrays.accumulationTanks);
        await setArray('waterTanks', arrays.waterTanks);
        await setArray('solarCollectors', arrays.solarCollectors);
        await setArray('inverters', arrays.inverters);
        await setArray('batteries', arrays.batteries);
    } else if (type == 'loyaltyPoints') {
        await processLoyaltyReward(args.data, locals);
    } else {
        error(400, 'Bad Request');
    }

    return new Response(null, {
        status: Number(200),
    });
};

