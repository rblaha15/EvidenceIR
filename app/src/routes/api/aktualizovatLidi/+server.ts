import type { RequestHandler } from './$types';
import type { Clovek } from '$lib/firebase'
import { initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { credential } from 'firebase-admin'
import { getAuth, type UserRecord } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'

import serviceAccount from "./firebase-adminsdk.json";

try {
    initializeApp({
        credential: credential.cert(serviceAccount as ServiceAccount),
        databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app',
    })
} catch (e) {
    console.error(e)
}

const auth = getAuth()
const realtime = getDatabase()


export const POST: RequestHandler = async ({ request }) => {
    const { lidi }: { lidi: Clovek[] } = await request.json();

    console.log(lidi);
    for (const [email, montazky, uvadeci, osoba] of lidi) {
        const user: UserRecord = await (async () => {
            try {
                return await auth.getUserByEmail(email)
            } catch (e) {
                console.log(`Vytváříme ${email}`)
                return await auth.createUser({
                    email: email,
                    password: "123456"
                })
            }
        })()
        console.log(`Ukládáme ${email}`)
        await realtime.ref("lidi").child(user.uid).set([email, montazky, uvadeci, osoba])
    }

    return new Response(null, {
        status: Number(200)
    });
};
