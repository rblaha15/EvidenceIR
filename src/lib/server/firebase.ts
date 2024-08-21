
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
    FIREBASE_INFO,
} from "$env/static/private";

const initApp = async () => {
    try {
        const cred = JSON.parse(FIREBASE_INFO);

        return initializeApp({
            credential: cert(cred),
            databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app'
        });
    } catch (e) {
        console.error(e)
    }
}

const apps = getApps();
export const app = apps.length > 0 ? apps[0] : await initApp()