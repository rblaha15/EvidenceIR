import type { Company, Person, SparePart, Technician } from '$lib/client/realtime';
import { checkAdmin, checkToken, createUser, getUserByEmail, getUsersByEmail, removeUsers } from '$lib/server/auth';
import {
    people,
    removePerson,
    setAccumulationTanks,
    setCompanies,
    setPersonDetails,
    setSolarCollectors,
    setSpareParts,
    setTechnicians,
    setWaterTanks,
} from '$lib/server/realtime';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { UserRecord } from 'firebase-admin/auth';
import { type LoyaltyProgramTrigger } from '$lib/client/loyaltyProgram';
import '$lib/extensions';
import { processLoyaltyReward } from '$lib/server/loyaltyProgram';

export const POST: RequestHandler = async ({ request, url }) => {
    const t = url.searchParams.get('token');
    const typ = url.searchParams.get('type') as 'users' | 'companies' | 'technicians' | 'spareParts' | 'accumulationTanks' | 'waterTanks' | 'solarCollectors' | 'loyaltyPoints' | null;

    if (!typ) error(400, 'Bad Request');

    const token = await checkToken(t);
    if (!token) error(401, 'Unauthorized');

    if (typ == 'users') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const oldPeople = (await people()).mapTo((_, p) => p.email);
        const { array: newPeople }: { array: Person[] } = await request.json();

        const toRemove = oldPeople.filter(p => !newPeople.some(p2 => p2.email == p));
        const toAdd = newPeople.map(p => p.email).filter(p => !oldPeople.some(p2 => p2 == p));
        const toChange = newPeople.map(p => p.email).filter(p => oldPeople.some(p2 => p2 == p));

        const usersToDelete = (await getUsersByEmail(toRemove)).flatMap(r => r.users);

        await Promise.all(usersToDelete.map(u => {
            console.log(`Removing ${u.email}`);
            return removePerson(u.uid);
        }));
        await removeUsers(usersToDelete.map(u => u.uid));

        const usersToChange = [
            ...await Promise.all(toAdd.map(email => new Promise<UserRecord>((resolve, reject) => {
                console.log(`Creating ${email}`);
                createUser({ email, disabled: true }).then(resolve).catch(e => {
                    if (typeof e == 'object' && e && 'code' in e && e.code == 'auth/email-already-exists')
                        getUserByEmail(email).then(resolve).catch(reject);
                    else reject(e);
                });
            }))),
            ...(await getUsersByEmail(toChange)).flatMap(r => r.users),
        ];

        await Promise.all(usersToChange.map(u => {
            const d = newPeople.find(p => p.email.toLowerCase() == u.email?.toLowerCase())!;
            console.log(`Editing ${u.email}: ${JSON.stringify(d)}`);
            return setPersonDetails(u.uid, d);
        }));
    } else if (typ == 'companies') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: Company[] } = await request.json();
        await setCompanies(array);
    } else if (typ == 'technicians') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: Technician[] } = await request.json();
        await setTechnicians(array);
    } else if (typ == 'spareParts') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: SparePart[] } = await request.json();
        await setSpareParts(array);
    } else if (typ == 'accumulationTanks') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: string[] } = await request.json();
        await setAccumulationTanks(array);
    } else if (typ == 'waterTanks') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: string[] } = await request.json();
        await setWaterTanks(array);
    } else if (typ == 'solarCollectors') {
        if (!await checkAdmin(token)) error(401, 'Unauthorized');
        const { array }: { array: string[] } = await request.json();
        await setSolarCollectors(array);
    } else if (typ == 'loyaltyPoints') {
        const data: LoyaltyProgramTrigger = await request.json();
        await processLoyaltyReward(data, token);
    }

    return new Response(null, {
        status: Number(200),
    });
};

