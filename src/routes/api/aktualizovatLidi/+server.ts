import type { Person } from '$lib/client/realtime';
import { checkAdmin, checkToken, createUser, getUsersByEmail, removeAccounts, removeUsers } from '$lib/server/auth';
import { setPersonDetails, people, removePerson } from '$lib/server/realtime';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	const t = url.searchParams.get("token")

	const token = await checkToken(t)
	if (!token) error(401, "Unauthorized")
	if (!await checkAdmin(token)) error(401, "Unauthorized")

	// await removeAccounts()

	const oldPeople = (await people()).map(p => p.email)
	const { people: newPeople }: { people: Person[] } = await request.json();

	const toRemove = oldPeople.filter(p => !newPeople.some(p2 => p2.email == p))
	const toAdd = newPeople.map(p => p.email).filter(p => !oldPeople.some(p2 => p2 == p))
	const toChange = newPeople.map(p => p.email).filter(p => oldPeople.some(p2 => p2 == p))

	const usersToDelete = (await getUsersByEmail(toRemove)).flatMap(r => r.users)

	await Promise.all(usersToDelete.map(u => {
		console.log(`Removing ${u.email}`)
		return removePerson(u.uid);
	}))
	await removeUsers(usersToDelete.map(u => u.uid))

	const usersToChange = [
		...await Promise.all(toAdd.map(email => {
			console.log(`Creating ${email}`)
			return createUser({ email, disabled: true });
		})),
		...(await getUsersByEmail(toChange)).flatMap(r => r.users),
	]

	await Promise.all(usersToChange.map(u => {
		const d = newPeople.find(p => p.email.toLowerCase() == u.email?.toLowerCase())!
		console.log(`Editing ${u.email}: ${JSON.stringify(d)}`)
		return setPersonDetails(u.uid, d);
	}))

	return new Response(null, {
		status: Number(200)
	});
};