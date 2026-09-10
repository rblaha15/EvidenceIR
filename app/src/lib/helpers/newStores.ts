import { browser, dev } from '$app/environment';
import { isAdmin, pendingUser } from '$lib/client/auth';
import { derived, get, type Readable, readonly, type Writable, writable } from 'svelte/store';

export type LazyWritable<T> = {
    current: T;
    readonly store: Writable<T>;
};

export type LazyReadable<T> = {
    readonly current: T;
    readonly store: Readable<T>;
};

export function storable<T>(key: string): Writable<T | undefined>;
export function storable<T>(key: string, defaultValue: T): Writable<T>;
export function storable<T>(originalKey: string, defaultValue?: T) {
    const store = writable<T | undefined>(defaultValue);
    let key: string;

    pendingUser.subscribe($user => {
        if ($user == 'pending') {
            if (dev) console.warn(`Storable ${originalKey} was initialized before auth loaded. This could cause sync issues and is not recommended.`);
            return;
        }

        const email = $user?.email ?? 'anonymous';
        key = `storable_${email}_${originalKey}`;

        if (browser) {
            const currentValue = localStorage.getItem(key);
            if (currentValue != null && currentValue != 'undefined' && currentValue != 'null')
                store.set(JSON.parse(currentValue));
            else if (defaultValue != undefined) localStorage.setItem(key, JSON.stringify(defaultValue));
        }
    });

    const _storeable: Writable<T | undefined> = {
        subscribe: store.subscribe,
        set: (value) => {
            if (browser)
                if (value != undefined)
                    localStorage.setItem(key, JSON.stringify(value));
                else
                    localStorage.removeItem(key);
            store.set(value);
        },
        update: (updater) => {
            const updated = updater(get(store));

            if (browser)
                if (updated != undefined)
                    localStorage.setItem(key, JSON.stringify(updated));
                else
                    localStorage.removeItem(key);
            store.set(updated);
        },
    };
    return _storeable;
}

export function lazyStorable<T>(key: string): LazyWritable<T | undefined>;
export function lazyStorable<T>(key: string, defaultValue: T): LazyWritable<T>;
export function lazyStorable<T>(originalKey: string, defaultValue?: T) {
    let store: Writable<T | undefined> | null = null;
    const getStore = () => store ??= storable(originalKey, defaultValue);

    return {
        get store() {
            return getStore();
        },
        get current() {
            return get(getStore());
        },
        set current(value: T | undefined) {
            getStore().set(value)
        },
    }
}

export function lazyReadonly<T>(lazyStore: LazyReadable<T>): LazyReadable<T> {
    let store: Readable<T> | null = null;
    const getStore = () => store ??= readonly(lazyStore.store);

    return {
        get store() {
            return getStore();
        },
        get current() {
            return lazyStore.current;
        },
    };
}

export const aA = derived(isAdmin, a => a ? ' (A)' : '');
export const aR = derived(isAdmin, a => a ? ' (R)' : '');
export const iaA = ' (A)';
export const iaR = (a: boolean) => a ? ' (R)' : '';