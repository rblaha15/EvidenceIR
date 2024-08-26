import { browser } from '$app/environment';
import { page } from '$app/stores';
import { derived, get, writable, type Writable } from 'svelte/store';

export const relUrl = derived(page, (page) => (url: string) => "/" + page.params.lang + url);

export function storable<T>(data: T | null, key: string): Writable<T | null> {
    const store = writable<T | null>(data);
    const isBrowser = () => browser;

    key = `storable-${key}`;

    if (isBrowser() && localStorage.getItem(key))
        store.set(JSON.parse(localStorage[key]));

    return {
        subscribe: store.subscribe,
        set: value => {
            if (isBrowser()) value != null ? localStorage.setItem(key, JSON.stringify(value)) : localStorage.removeItem(key)
            store.set(value);
        },
        update: (updater) => {
            const updated = updater(get(store));

            if (isBrowser()) updated != null ? localStorage.setItem(key, JSON.stringify(updated)) : localStorage.removeItem(key)
            store.set(updated);
        }
    };
}

