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

type Millis = number;
export const getAllIRs = async () => {
    const store = writable<(IR | Deleted<IRID>)[] | 'loading'>('loading');
    const lastUpdatedAtIR = storable<Millis>('lastUpdatedAtIR2', 500);
    const lastUpdatedAtMillis = get(lastUpdatedAtIR);
    const lastUpdatedAt = lastUpdatedAtMillis ? Timestamp.fromMillis(lastUpdatedAtMillis) : null;
    if (lastUpdatedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('IR');
    store.set(currentOffline);
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
    const store = writable<(Raw<FormNSP> | Deleted<SPID>)[] | 'loading'>('loading');
    const lastUpdatedAtSP = storable<Millis>('lastUpdatedAtSP', 500);
    const lastUpdatedAtMillis = get(lastUpdatedAtSP);
    const lastUpdatedAt = lastUpdatedAtMillis ? Timestamp.fromMillis(lastUpdatedAtMillis) : null;
    if (lastUpdatedAtMillis == 500) await clearLocalDatabase();
    const currentOffline = await odm.getAll('SP');
    store.set(currentOffline);
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


export const getStoreIR = (irid: IRID) => {
    const store = writable<IR | Deleted<IRID> | undefined | 'loading'>('loading');
    getOfflineStoreIR(irid).subscribe(store.set);
    firestoreDatabase.getIR(irid).then(store.set);
    return store;
};


export const getStoreIndependentProtocol = (spid: SPID) => {
    const store = writable<Raw<FormNSP> | Deleted<SPID> | undefined | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(spid).subscribe(store.set);
    firestoreDatabase.getIndependentProtocol(spid).then(store.set);
    return store;
};