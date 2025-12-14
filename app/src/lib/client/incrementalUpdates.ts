import { storable } from '$lib/helpers/stores';
import { extractIRID, extractSPID } from '$lib/helpers/ir';
import { get, writable } from 'svelte/store';
import { clearLocalDatabase, offlineDatabaseManager as odm } from '$lib/client/offline.svelte';
import { firestoreDatabase } from '$lib/client/firestore';
import { Timestamp } from 'firebase/firestore';
import { getIsOnline } from '$lib/client/realtime';
import { browser } from '$app/environment';

type Millis = number;
export const getAllIRs = async () => {
    const lastUpdatedAtIR = storable<Millis>('lastUpdatedAtIR', 500);
    const lastUpdatedAtMillis = get(lastUpdatedAtIR);
    const lastUpdatedAt = lastUpdatedAtMillis ? Timestamp.fromMillis(lastUpdatedAtMillis) : null;
    if (lastUpdatedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('IR');
    const store = writable(currentOffline);
    firestoreDatabase.getChangedIRs(lastUpdatedAt).then(changes => {
        firestoreDatabase.getDeletedIRs(lastUpdatedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(extractIRID);
            store.set(newList);
            odm.setAll('IR', newList.associateBy(extractIRID));
            if (changes.length || deletes.length) lastUpdatedAtIR.set([
                ...changes.map(ir => ir.keysChangedAt),
                ...deletes.map(ir => ir.deletedAt),
            ].maxOf(t => t.toMillis()));
        });
    });
    return store;
};

export const getAllIndependentProtocols = async () => {
    const lastUpdatedAtSP = storable<Millis>('lastUpdatedAtSP', 500);
    const lastUpdatedAtMillis = get(lastUpdatedAtSP);
    const lastUpdatedAt = lastUpdatedAtMillis ? Timestamp.fromMillis(lastUpdatedAtMillis) : null;
    if (lastUpdatedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('SP');
    const store = writable(currentOffline);
    firestoreDatabase.getChangedIndependentProtocols(lastUpdatedAt).then(changes => {
        firestoreDatabase.getDeletedIndependentProtocols(lastUpdatedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(extractSPID);
            store.set(newList);
            odm.setAll('SP', newList.associateBy(extractSPID));
            if (changes.length || deletes.length) lastUpdatedAtSP.set([
                ...changes.map(sp => sp.zasah.createdAt),
                ...deletes.map(sp => sp.deletedAt),
            ].maxOf(t => t.toMillis()));
        });
    });
    return store;
};