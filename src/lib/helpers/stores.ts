import { browser } from '$app/environment';
import { get, writable, type Writable } from 'svelte/store';
import { currentUser } from '$lib/client/auth';

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
