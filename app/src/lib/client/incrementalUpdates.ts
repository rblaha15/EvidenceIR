import { storable } from '$lib/helpers/stores';
import { type IRID, type NSPID } from '$lib/helpers/ir';
import { get, type Writable, writable } from 'svelte/store';
import {
    clearLocalDatabase,
    getOfflineStoreIndependentProtocol,
    getOfflineStoreIR,
    offlineDatabaseManager as odm,
} from '$lib/client/db/offline.svelte';
import type { Data, ID, IR, NSP, Timestamp } from '$lib/data';
import { isOnline } from '$lib/client/online';
import { mongoDatabase } from "$lib/client/db/mongo";

const v = 7

const defaultValue = 500;

const lastChangedAtIR = storable<Timestamp>(`lastUpdatedChangedAtIR${v}`, defaultValue);
const lastChangedAtSP = storable<Timestamp>(`lastUpdatedChangedAtSP${v}`, defaultValue);

export const resetStores = () => {
    lastChangedAtIR.set(defaultValue);
    lastChangedAtSP.set(defaultValue);
}

export type Results<T extends 'IR' | 'NSP'> =
    { data: Data<T>[], status: 'loading' | 'loadingOnline' | 'loaded' };

const getData = async <T extends 'IR' | 'NSP'>(type: T, store: Writable<Results<T>>, fetch: typeof window.fetch) => {
    const lastChangedAtStore = { IR: lastChangedAtIR, NSP: lastChangedAtSP }[type];
    const lastChangedAt = get(lastChangedAtStore);
    if (lastChangedAt == defaultValue) await clearLocalDatabase(); // Clean up old data when changing the store
    const currentOffline: Data<T>[] = await odm.getAll(type);
    console.log('current', currentOffline.map(d => d.meta.id));
    store.set({ data: currentOffline, status: 'loadingOnline' });
    const getChanged = { IR: mongoDatabase.getChangedIRs, NSP: mongoDatabase.getChangedNSPs }[type];
    const changes = await getChanged(lastChangedAt, fetch) as Data<T>[];
    if (!changes.length) {
        console.log('no changes');
        store.set({ data: currentOffline, status: 'loaded' });
        return;
    }
    console.log('changes', changes.map(d => d.meta.id));
    const newList = [...currentOffline, ...changes].distinctBy(it => it.meta.id);
    console.log('result', newList.map(d => d.meta.id));
    store.set({ data: newList, status: 'loaded' });
    await odm.setAll(type, newList.associateBy(it => it.meta.id as ID<T>))
    const key = (it: Data<T>) =>
        ({ IR: (it as IR).meta.changedAt, NSP: (it as NSP).meta.changedAt }[type])
    lastChangedAtStore.set(changes.map(key).max());
}

export const getAllIRs = (fetch: typeof window.fetch = window.fetch) => {
    const store = writable<Results<'IR'>>({ data: [], status: 'loading' });
    getData('IR', store, fetch).then();
    return store;
};

export const getAllNSPs = (fetch: typeof window.fetch) => {
    const store = writable<Results<'NSP'>>({ data: [], status: 'loading' });
    getData('NSP', store, fetch).then();
    return store;
};

export const getStoreIR = (irid: IRID, fetch: typeof window.fetch) => {
    const store = writable<IR | null | 'loading'>('loading');
    getOfflineStoreIR(irid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline) mongoDatabase.getIR(irid, fetch).then(store.set);
    });
    return store;
};


export const getStoreNSP = (nspid: NSPID, fetch: typeof window.fetch) => {
    const store = writable<NSP | null | 'loading'>('loading');
    getOfflineStoreIndependentProtocol(nspid).subscribe(store.set);
    isOnline.subscribe($isOnline => {
        if ($isOnline) mongoDatabase.getNSP(nspid, fetch).then(store.set);
    });
    return store;
};