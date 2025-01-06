import type { Company, Person, Technician } from '$lib/client/realtime';
import { checkAdmin, checkToken, createUser, getUsersByEmail, removeUsers } from '$lib/server/auth';
import { people, removePerson, setCompanies, setPersonDetails, setTechnicians } from '$lib/server/realtime';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
    const t = url.searchParams.get('token');
    const typ = url.searchParams.get('type') as 'lidi' | 'firmy' | 'technici' | null;

    if (!typ) error(400, 'Bad Request');

    const token = await checkToken(t);
    if (!token) error(401, 'Unauthorized');
    if (!await checkAdmin(token)) error(401, 'Unauthorized');

    if (typ == 'lidi') {
        const oldPeople = (await people()).map(p => p.email);
        const { people: newPeople }: { people: Person[] } = await request.json();

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
            ...await Promise.all(toAdd.map(email => {
                console.log(`Creating ${email}`);
                return createUser({ email, disabled: true });
            })),
            ...(await getUsersByEmail(toChange)).flatMap(r => r.users),
        ];

        await Promise.all(usersToChange.map(u => {
            const d = newPeople.find(p => p.email.toLowerCase() == u.email?.toLowerCase())!;
            console.log(`Editing ${u.email}: ${JSON.stringify(d)}`);
            return setPersonDetails(u.uid, d);
        }));
    } else if (typ == 'firmy') {
        const { companies }: { companies: Company[] } = await request.json();
        await setCompanies(companies);
    } else if (typ == 'technici') {
        const { technicians }: { technicians: Technician[] } = await request.json();
        await setTechnicians(technicians);
    }

    return new Response(null, {
        status: Number(200)
    });
};