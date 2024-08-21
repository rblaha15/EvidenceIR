
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
    FIREBASE_INFO,
} from "$env/static/private";
import { writeFile } from 'fs/promises';

const initApp = async () => {
    try {
        await writeFile('./firebase-adminsdk.json', FIREBASE_INFO);

        return initializeApp({
            credential: cert('./firebase-adminsdk.json'),
            databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app'
        }, Math.random().toString());
    } catch (e) {
        console.error(e)
    }
}

const apps = getApps();
export const app = apps.length > 0 ? apps[0] : await initApp()