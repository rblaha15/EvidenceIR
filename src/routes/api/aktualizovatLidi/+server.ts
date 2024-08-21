import type { Person } from '$lib/client/realtime';
import { checkAdmin, checkToken, getUserOrCreate } from '$lib/server/auth';
import { setPersonDetails } from '$lib/server/realtime';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	const t = url.searchParams.get("token")

	const token = await checkToken(t)
	if (!token) error(401, "Unauthorized")
	if (!await checkAdmin(token)) error(401, "Unauthorized")

	const { lidi }: { lidi: Person[] } = await request.json();

	for (const person of lidi) {
		const user = await getUserOrCreate(person.email);
		if (user.email?.toLowerCase() != person.email.toLowerCase()) error(500, `${user.email} se neshoduje s ${person.email}`)
		await setPersonDetails(user.uid, person)
	}

	console.log(`Hotovo`);

	return new Response(null, {
		status: Number(200)
	});
};
