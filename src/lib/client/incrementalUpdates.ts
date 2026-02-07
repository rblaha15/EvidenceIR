import { storable } from '$lib/helpers/stores';
import { type IRID, type SPID } from '$lib/helpers/ir';
import { get, writable } from 'svelte/store';
import {
    clearLocalDatabase,
    getOfflineStoreIndependentProtocol,
    getOfflineStoreIR,
    offlineDatabaseManager as odm,
} from '$lib/client/offline.svelte';
import { firestoreDatabase } from '$lib/client/firestore';
import { Timestamp } from 'firebase/firestore';
import type { IR, NSP } from '$lib/data';
import { isOnline } from '$lib/client/realtimeOnline';

const v = 4

type Millis = number;
export const getAllIRs = async () => {
    const store = writable<IR[] | 'loading'>('loading');
    const lastUpdatedChangedAtIR = storable<Millis>(`lastUpdatedChangedAtIR${v}`, 500);
    const lastUpdatedDeletedAtIR = storable<Millis>(`lastUpdatedDeletedAtIR${v}`, 500);
    const lastUpdatedChangedAtMillis = get(lastUpdatedChangedAtIR);
    const lastUpdatedDeletedAtMillis = get(lastUpdatedDeletedAtIR);
    const lastUpdatedChangedAt = lastUpdatedChangedAtMillis ? Timestamp.fromMillis(lastUpdatedChangedAtMillis) : null;
    const lastUpdatedDeletedAt = lastUpdatedDeletedAtMillis ? Timestamp.fromMillis(lastUpdatedDeletedAtMillis) : null;
    if (lastUpdatedDeletedAtMillis == 500) await clearLocalDatabase(); // Clean up old data when changing the store
    const currentOffline = await odm.getAll('IR');
    store.set(currentOffline);
    firestoreDatabase.getChangedIRs(lastUpdatedChangedAt).then(changes => {
        firestoreDatabase.getDeletedIRs(lastUpdatedDeletedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(ir => ir.meta.id);
            store.set(newList);
            odm.setAll('IR', newList.associateBy(ir => ir.meta.id)).then(() => {
                if (changes.length) lastUpdatedChangedAtIR.set(
                    changes.map(ir => ir.meta.keysChangedAt).maxOf(t => t.toMillis()),
                );
                if (deletes.length) lastUpdatedDeletedAtIR.set(
                    deletes.map(ir => ir.meta.deletedAt).maxOf(t => t.toMillis()),
                );
            });
        });
    });
    return store;
};

export const getAllIndependentProtocols = async () => {
    const store = writable<NSP[] | 'loading'>('loading');
    const lastUpdatedChangedAtSP = storable<Millis>(`lastUpdatedChangedAtSP${v}`, 500);
    const lastUpdatedDeletedAtSP = storable<Millis>(`lastUpdatedDeletedAtSP${v}`, 500);
    const lastUpdatedChangedAtMillis = get(lastUpdatedChangedAtSP);
    const lastUpdatedDeletedAtMillis = get(lastUpdatedDeletedAtSP);
    const lastUpdatedChangedAt = lastUpdatedChangedAtMillis ? Timestamp.fromMillis(lastUpdatedChangedAtMillis) : null;
    const lastUpdatedDeletedAt = lastUpdatedDeletedAtMillis ? Timestamp.fromMillis(lastUpdatedDeletedAtMillis) : null;
    if (lastUpdatedDeletedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('SP');
    store.set(currentOffline);
    firestoreDatabase.getChangedIndependentProtocols(lastUpdatedChangedAt).then(changes => {
        firestoreDatabase.getDeletedIndependentProtocols(lastUpdatedDeletedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(nsp => nsp.meta.id);
            store.set(newList);
            odm.setAll('SP', newList.associateBy(nsp => nsp.meta.id)).then(() => {
                if (changes.length) lastUpdatedChangedAtSP.set(
                    changes.map(ir => ir.meta.createdAt).maxOf(t => t.toMillis()),
                );
                if (deletes.length) lastUpdatedDeletedAtSP.set(
                    deletes.map(ir => ir.meta.deletedAt).maxOf(t => t.toMillis()),
                );
            });
        });
    });
    return store;
};


export const getStoreIR = (irid: IRID) => {
    const store = writable<IR | undefined | 'loading'>('loading');
    getOfflineStoreIR(irid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline) firestoreDatabase.getIR(irid).then(store.set);
    });
    return store;
};


export const getStoreIndependentProtocol = (spid: SPID) => {
    const store = writable<NSP | undefined | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(spid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline)
            firestoreDatabase.getIndependentProtocol(spid).then(store.set);
    });
    return store;
};