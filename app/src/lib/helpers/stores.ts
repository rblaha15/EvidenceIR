import { browser } from '$app/environment';
import { page } from '$app/stores';
import { derived, get, writable, type Writable } from 'svelte/store';

export const relUrl = derived(page, (page) => (url: string) => "/" + page.params.lang + url);

export function storable<T>(defaultValue: T, key: string): Writable<T> {
    const store = writable<T>(defaultValue);
    const isBrowser = () => browser;

    key = `storable-${key}`;

    if (isBrowser())
        if (localStorage.getItem(key))
            store.set(JSON.parse(localStorage[key]));
        else
            localStorage.setItem(key, JSON.stringify(defaultValue))

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

