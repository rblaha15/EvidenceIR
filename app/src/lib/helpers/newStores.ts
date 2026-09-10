import { browser } from '$app/environment';
import { isAdmin, pendingUser } from '$lib/client/auth';
import { derived, get, type Writable, writable } from 'svelte/store';

export function storable<T>(key: string): Writable<T | undefined>;
export function storable<T>(key: string, defaultValue: T): Writable<T>;
export function storable<T>(originalKey: string, defaultValue?: T) {
    const store = writable<T | undefined>(defaultValue);
    let key: string;

    pendingUser.subscribe($user => {
        if ($user == 'pending') return;
        // console.log('USER', $user)
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

export const aA = derived(isAdmin, a => a ? ' (A)' : '');
export const aR = derived(isAdmin, a => a ? ' (R)' : '');
export const iaA = ' (A)';
export const iaR = (a: boolean) => a ? ' (R)' : '';