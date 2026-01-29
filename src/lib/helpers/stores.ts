import { browser } from '$app/environment';
import { derived, get, type Readable, writable, type Writable } from 'svelte/store';
import { currentUser, isUserAdmin } from '$lib/client/auth';

export function storable<T>(key: string): Writable<T | undefined>;
export function storable<T>(key: string, defaultValue: T): Writable<T>;

export function storable<T>(key: string, defaultValue?: T) {
    const store = writable<T | undefined>(defaultValue);

    currentUser.subscribe(user => {
        const uid = user?.uid ?? 'anonymous';
        key = `storable_${uid}_${key}`;

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

export const flattenStores = <T>(
    outer: Readable<Readable<T>>,
): Readable<T> => derived(outer, (inner, set) => inner.subscribe(set));

export const flatDerived = <T, U>(
    store: Readable<T>,
    fn: (value: T) => Readable<U>,
    innerEffect?: (result: U, value: T) => unknown,
): Readable<U> => derived(store, (value, set) => {
    const inner = fn(value);
    return inner.subscribe(result => {
        set(result);
        innerEffect?.(result, value);
    });
});

export const waitUntil = <T>(store: Readable<T>, predicate: (value: T) => boolean) =>
    new Promise(resolve => {
        store.subscribe(value => {
            if (predicate(value)) resolve(null);
        });
    });

export const aA = derived(isUserAdmin, a => a ? ' (A)' : '')
export const aR = derived(isUserAdmin, a => a ? ' (R)' : '')