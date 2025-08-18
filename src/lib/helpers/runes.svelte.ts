import { browser } from '$app/environment';
import { page } from '$app/state';
import type { IRID, SPID } from '$lib/helpers/ir';
import type { LanguageCode as LC } from '$lib/languages';

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

export const relUrl = (url = '', lang: LC | '?' = page.data.languageCode) =>
    `/${lang}${url}`;
export const iridUrl = (url = '', id: IRID = page.data.irid, lang: LC | '?' = page.data.languageCode) =>
    new URL(page.url.origin + relUrl(url, lang))
        .also(u => u.searchParams.append('irid', id))
        .let(u => u.pathname + u.search + u.hash);
export const spidUrl = (url = '', ids: SPID[] = page.data.spids, lang: LC | '?' = page.data.languageCode) =>
    new URL(page.url.origin + relUrl(url, lang))
        .also(u => u.searchParams.append('spid', ids.join(' ')))
        .let(u => u.pathname + u.search + u.hash);
export const detailIrUrl = (id: IRID = page.data.irid, lang: LC | '?' = page.data.languageCode) =>
    iridUrl('/detail', id, lang);
export const detailSpUrl = (ids: SPID[] = page.data.spids, lang: LC | '?' = page.data.languageCode) =>
    spidUrl('/detail', ids, lang);
