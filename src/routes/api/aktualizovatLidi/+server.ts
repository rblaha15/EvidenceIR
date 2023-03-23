import type { RequestHandler } from './$types';
import type { Clovek } from '$lib/firebase';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { writeFile } from 'fs/promises';
const { credential } = admin;

import dotenv from 'dotenv';
dotenv.config();

try {
	await writeFile('./firebase-adminsdk.json', process.env.FIREBASE_INFO ?? '');

	initializeApp({
		credential: credential.cert('./firebase-adminsdk.json'),
		databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app'
	});
} catch (e) {
	console.error(e);
}

const auth = getAuth();
const realtime = getDatabase();

export const POST: RequestHandler = async ({ request }) => {
	const { lidi }: { lidi: Clovek[] } = await request.json();

	for (const [email, montazky, uvadeci, osoba] of lidi) {
		const user: UserRecord = await (async () => {
			try {
				return await auth.getUserByEmail(email);
			} catch (e) {
				console.log(`Vytváříme ${email}`);
				return await auth.createUser({
					email: email,
					password: '123456'
				});
			}
		})();
		console.log(`Ukládáme ${email}`);
		await realtime.ref('lidi').child(user.uid).set([email, montazky, uvadeci, osoba]);
	}

	return new Response(null, {
		status: Number(200)
	});
};
