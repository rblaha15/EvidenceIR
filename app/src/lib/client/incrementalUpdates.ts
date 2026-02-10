import { storable } from '$lib/helpers/stores';
import { type IRID, type SPID } from '$lib/helpers/ir';
import { get, type Writable, writable } from 'svelte/store';
import {
    clearLocalDatabase,
    getOfflineStoreIndependentProtocol,
    getOfflineStoreIR,
    offlineDatabaseManager as odm,
} from '$lib/client/offline.svelte';
import { firestoreDatabase } from '$lib/client/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Data, DeletedData, ExistingData, ID, IR, NSP } from '$lib/data';
import { isOnline } from '$lib/client/realtimeOnline';

const v = 5

const defaultValue = 500;

type Millis = number;
const lastChangedAtIR = storable<Millis>(`lastUpdatedChangedAtIR${v}`, defaultValue);
const lastDeletedAtIR = storable<Millis>(`lastUpdatedDeletedAtIR${v}`, defaultValue);
const lastChangedAtSP = storable<Millis>(`lastUpdatedChangedAtSP${v}`, defaultValue);
const lastDeletedAtSP = storable<Millis>(`lastUpdatedDeletedAtSP${v}`, defaultValue);

export const resetStores = () => {
    lastChangedAtIR.set(defaultValue);
    lastDeletedAtIR.set(defaultValue);
    lastChangedAtSP.set(defaultValue);
    lastDeletedAtSP.set(defaultValue);
}

export type Results<T extends 'IR' | 'NSP'> =
    { data: Data<T>[], status: 'loading' | 'loadingOnline' | 'loaded' };

const getData = async <T extends 'IR' | 'NSP'>(type: T, store: Writable<Results<T>>) => {
    const lastChangedAtStore = { IR: lastChangedAtIR, NSP: lastChangedAtSP }[type];
    const lastDeletedAtStore = { IR: lastDeletedAtIR, NSP: lastDeletedAtSP }[type];
    const lastChangedAtMillis = get(lastChangedAtStore);
    const lastDeletedAtMillis = get(lastDeletedAtStore);
    const lastChangedAt = lastChangedAtMillis ? Timestamp.fromMillis(lastChangedAtMillis) : null;
    const lastDeletedAt = lastDeletedAtMillis ? Timestamp.fromMillis(lastDeletedAtMillis) : null;
    if (lastDeletedAtMillis == defaultValue && lastChangedAtMillis == defaultValue) await clearLocalDatabase(); // Clean up old data when changing the store
    const currentOffline: Data<T>[] = await odm.getAll(type);
    store.set({ data: currentOffline, status: 'loadingOnline' });
    const getChanged = { IR: firestoreDatabase.getChangedIRs, NSP: firestoreDatabase.getChangedNSPs }[type];
    const getDeleted = { IR: firestoreDatabase.getDeletedIRs, NSP: firestoreDatabase.getDeletedNSPs }[type];
    const changes = await getChanged(lastChangedAt) as ExistingData<T>[];
    const deletes = await getDeleted(lastDeletedAt) as DeletedData<T>[];
    const newList = [...currentOffline, ...changes, ...deletes].distinctBy(it => it.meta.id);
    store.set({ data: newList, status: 'loaded' });
    await odm.setAll(type, newList.associateBy(it => it.meta.id as ID<T>))
    const key = (it: ExistingData<T>) =>
        ({ IR: (it as IR).meta.keysChangedAt, NSP: (it as NSP).meta.createdAt }[type])
    if (changes.length) lastChangedAtStore.set(
        changes.map(key).maxOf(t => t.toMillis()),
    );
    if (deletes.length) lastDeletedAtStore.set(
        deletes.map(ir => ir.meta.deletedAt).maxOf(t => t.toMillis()),
    );
}

export const getAllIRs = () => {
    const store = writable<Results<'IR'>>({ data: [], status: 'loading' });
    getData('IR', store).then();
    return store;
};

export const getAllNSPs = () => {
    const store = writable<Results<'NSP'>>({ data: [], status: 'loading' });
    getData('NSP', store).then();
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


export const getStoreNSP = (spid: SPID) => {
    const store = writable<NSP | undefined | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(spid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline)
            firestoreDatabase.getNSP(spid).then(store.set);
    });
    return store;
};