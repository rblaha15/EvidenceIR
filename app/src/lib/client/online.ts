import { browser } from '$app/environment';
import { get, readable } from 'svelte/store';

export const isOnline = readable(
    browser ? navigator.onLine : true,
    set => {
        if (!browser) return;

        const update = () => set(navigator.onLine);

        window.addEventListener('online', update);
        window.addEventListener('offline', update);

        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }
);
export const getIsOnline = () => get(isOnline);