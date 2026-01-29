import { storable } from '$lib/helpers/stores';
import { extractIRID, extractSPID, type IRID, type SPID } from '$lib/helpers/ir';
import { get, writable } from 'svelte/store';
import {
    clearLocalDatabase,
    getOfflineStoreIndependentProtocol,
    getOfflineStoreIR,
    offlineDatabaseManager as odm,
} from '$lib/client/offline.svelte';
import { firestoreDatabase } from '$lib/client/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { Deleted, IR } from '$lib/data';
import { isOnline } from '$lib/client/realtimeOnline';

type Millis = number;
export const getAllIRs = async () => {
    const store = writable<(IR | Deleted<IRID>)[] | 'loading'>('loading');
    const lastUpdatedChangedAtIR = storable<Millis>('lastUpdatedChangedAtIR', 500);
    const lastUpdatedDeletedAtIR = storable<Millis>('lastUpdatedDeletedAtIR', 500);
    const lastUpdatedChangedAtMillis = get(lastUpdatedChangedAtIR);
    const lastUpdatedDeletedAtMillis = get(lastUpdatedDeletedAtIR);
    const lastUpdatedChangedAt = lastUpdatedChangedAtMillis ? Timestamp.fromMillis(lastUpdatedChangedAtMillis) : null;
    const lastUpdatedDeletedAt = lastUpdatedDeletedAtMillis ? Timestamp.fromMillis(lastUpdatedDeletedAtMillis) : null;
    if (lastUpdatedDeletedAtMillis == 500) await clearLocalDatabase(); // Clean up old data when changing the store
    const currentOffline = await odm.getAll('IR');
    store.set(currentOffline);
    firestoreDatabase.getChangedIRs(lastUpdatedChangedAt).then(changes => {
        firestoreDatabase.getDeletedIRs(lastUpdatedDeletedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(extractIRID);
            store.set(newList);
            odm.setAll('IR', newList.associateBy(extractIRID));
            if (changes.length) lastUpdatedChangedAtIR.set(
                changes.map(ir => ir.keysChangedAt).maxOf(t => t.toMillis()),
            );
            if (deletes.length) lastUpdatedDeletedAtIR.set(
                deletes.map(ir => ir.deletedAt).maxOf(t => t.toMillis()),
            );
        });
    });
    return store;
};

export const getAllIndependentProtocols = async () => {
    const store = writable<(Raw<FormNSP> | Deleted<SPID>)[] | 'loading'>('loading');
    const lastUpdatedChangedAtSP = storable<Millis>('lastUpdatedChangedAtSP', 500);
    const lastUpdatedDeletedAtSP = storable<Millis>('lastUpdatedDeletedAtSP', 500);
    const lastUpdatedChangedAtMillis = get(lastUpdatedChangedAtSP);
    const lastUpdatedDeletedAtMillis = get(lastUpdatedDeletedAtSP);
    const lastUpdatedChangedAt = lastUpdatedChangedAtMillis ? Timestamp.fromMillis(lastUpdatedChangedAtMillis) : null;
    const lastUpdatedDeletedAt = lastUpdatedDeletedAtMillis ? Timestamp.fromMillis(lastUpdatedDeletedAtMillis) : null;
    if (lastUpdatedDeletedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('SP');
    store.set(currentOffline);
    firestoreDatabase.getChangedIndependentProtocols(lastUpdatedChangedAt).then(changes => {
        firestoreDatabase.getDeletedIndependentProtocols(lastUpdatedDeletedAt).then(deletes => {
            const newList = [...currentOffline, ...changes, ...deletes].distinctBy(extractSPID);
            store.set(newList);
            odm.setAll('SP', newList.associateBy(extractSPID));
            odm.setAll('SP', newList.associateBy(extractSPID));
            if (changes.length) lastUpdatedChangedAtSP.set(
                changes.map(ir => ir.zasah.createdAt).maxOf(t => t.toMillis()),
            );
            if (deletes.length) lastUpdatedDeletedAtSP.set(
                deletes.map(ir => ir.deletedAt).maxOf(t => t.toMillis()),
            );
        });
    });
    return store;
};


export const getStoreIR = (irid: IRID) => {
    const store = writable<IR | Deleted<IRID> | undefined | 'loading'>('loading');
    getOfflineStoreIR(irid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline) firestoreDatabase.getIR(irid).then(store.set);
    });
    return store;
};


export const getStoreIndependentProtocol = (spid: SPID) => {
    const store = writable<Raw<FormNSP> | Deleted<SPID> | undefined | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(spid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline)
            firestoreDatabase.getIndependentProtocol(spid).then(store.set);
    });
    return store;
};