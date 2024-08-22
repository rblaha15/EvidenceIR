import { browser } from '$app/environment';
import { page } from '$app/stores';
import { derived, get, writable, type Writable } from 'svelte/store';

export const relUrl = derived(page, (page) => (url: string) => "/" + page.params.lang + url);

export function storable<T>(data: T | undefined, name: string): Writable<T> {
    const store = writable(data);
    const isBrowser = () => browser;

    const address = `storable-${name}`;

    if (isBrowser() && localStorage[address])
        store.set(JSON.parse(localStorage[address]));

    return {
        subscribe: store.subscribe,
        set: value => {
            if (isBrowser()) localStorage[address] = JSON.stringify(value);
            store.set(value);
        },
        update: (updater) => {
            const updated = updater(get(store));

            if (isBrowser()) localStorage[address] = JSON.stringify(updated);
            store.set(updated);
        }
    };
}

