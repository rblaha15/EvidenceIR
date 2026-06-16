import { storable } from '$lib/helpers/stores';
import { type IRID, type NSPID } from '$lib/helpers/ir';
import { get, type Writable, writable } from 'svelte/store';
import {
    clearLocalDatabase,
    getOfflineStoreIndependentProtocol,
    getOfflineStoreIR,
    offlineDatabaseManager as odm,
} from '$lib/client/db/offline.svelte';
import type { Data, DeletedData, ExistingData, ID, IR, NSP, Timestamp } from '$lib/data';
import { isOnline } from '$lib/client/realtimeOnline';
import { mongoDatabase } from "$lib/client/db/mongo";

const v = 6

const defaultValue = 500;

const lastChangedAtIR = storable<Timestamp>(`lastUpdatedChangedAtIR${v}`, defaultValue);
const lastDeletedAtIR = storable<Timestamp>(`lastUpdatedDeletedAtIR${v}`, defaultValue);
const lastChangedAtSP = storable<Timestamp>(`lastUpdatedChangedAtSP${v}`, defaultValue);
const lastDeletedAtSP = storable<Timestamp>(`lastUpdatedDeletedAtSP${v}`, defaultValue);

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
    const lastChangedAt = get(lastChangedAtStore);
    const lastDeletedAt = get(lastDeletedAtStore);
    if (lastDeletedAt == defaultValue && lastChangedAt == defaultValue) await clearLocalDatabase(); // Clean up old data when changing the store
    const currentOffline: Data<T>[] = await odm.getAll(type);
    store.set({ data: currentOffline, status: 'loadingOnline' });
    const getChanged = { IR: mongoDatabase.getChangedIRs, NSP: mongoDatabase.getChangedNSPs }[type];
    const getDeleted = { IR: mongoDatabase.getDeletedIRs, NSP: mongoDatabase.getDeletedNSPs }[type];
    const changes = await getChanged(lastChangedAt) as ExistingData<T>[];
    const deletes = await getDeleted(lastDeletedAt) as DeletedData<T>[];
    const newList = [...currentOffline, ...changes, ...deletes].distinctBy(it => it.meta.id);
    store.set({ data: newList, status: 'loaded' });
    await odm.setAll(type, newList.associateBy(it => it.meta.id as ID<T>))
    const key = (it: ExistingData<T>) =>
        ({ IR: (it as IR).meta.changedAt, NSP: (it as NSP).meta.createdAt }[type])
    if (changes.length) lastChangedAtStore.set(
        changes.map(key).max(),
    );
    if (deletes.length) lastDeletedAtStore.set(
        deletes.map(ir => ir.meta.deletedAt).max(),
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
    const store = writable<IR | null | 'loading'>('loading');
    getOfflineStoreIR(irid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline) mongoDatabase.getIR(irid).then(store.set);
    });
    return store;
};


export const getStoreNSP = (nspid: NSPID) => {
    const store = writable<NSP | null | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(nspid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline)
            mongoDatabase.getNSP(nspid).then(store.set);
    });
    return store;
};