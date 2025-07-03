import { browser } from '$app/environment';
import { page } from '$app/state';

class Effect<T> {
    value = $state() as T;

    constructor(value: T) {
        this.value = value;
    }
}

type GetStorableState = {
    <T>(key: string): Effect<T | undefined>;
    <T>(key: string, defaultValue: T): Effect<T>;
};

export const storableState: GetStorableState = <T>(key: string, defaultValue?: T) => {
    const state = new Effect(defaultValue);
    key = `storable_${key}`;

    if (browser) {
        const currentValue = localStorage.getItem(key);
        if (currentValue != null && currentValue != 'undefined' && currentValue != 'null')
            state.value = JSON.parse(currentValue);
        else if (defaultValue != undefined) localStorage.setItem(key, JSON.stringify(defaultValue));
    }

    $effect(() => {
        const value = state.value;
        if (browser)
            if (value != undefined)
                localStorage.setItem(key, JSON.stringify(value));
            else
                localStorage.removeItem(key);
    });

    return state;
};

export const relUrl = (url = '', lang = page.data.languageCode) =>
    `/${lang}${url}`;
export const iridUrl = (url = '', id = page.data.irid, lang = page.data.languageCode) =>
    new URL(page.url.origin + relUrl(url, lang))
        .also(u => u.searchParams.append('irid', id))
        .let(u => u.pathname + u.search + u.hash);
export const spidUrl = (url = '', id = page.data.spid, lang = page.data.languageCode) =>
    new URL(page.url.origin + relUrl(url, lang))
        .also(u => u.searchParams.append('spid', id))
        .let(u => u.pathname + u.search + u.hash);
export const detailIrUrl = (id = page.data.irid, lang = page.data.languageCode) =>
    iridUrl('/detail', id, lang);
export const detailSpUrl = (id = page.data.spid, lang = page.data.languageCode) =>
    spidUrl('/detail', id, lang);
