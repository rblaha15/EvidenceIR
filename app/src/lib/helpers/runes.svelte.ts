import { browser } from '$app/environment';
import { page } from '$app/state';
import type { IRID, NSPID } from '$lib/helpers/ir';
import type { LanguageCode as LC } from '$lib/languageCodes';

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
    lang == '?' ? url : `/${lang}${url}`;
export const iridUrl = (url = '', id: IRID = page.data.irid, lang: LC | '?' = page.data.languageCode) =>
    new URL('file://' + relUrl(url, lang))
        .also(u => u.searchParams.append('irid', id))
        .let(u => u.pathname + u.search + u.hash);
export const nspidUrl = (url = '', ids: NSPID[] = page.data.nspids, lang: LC | '?' = page.data.languageCode) =>
    new URL('file://' + relUrl(url, lang))
        .also(u => u.searchParams.append('nspid', ids.join(' ')))
        .let(u => u.pathname + u.search + u.hash);
export const detailUrlIR = (id: IRID = page.data.irid, lang: LC | '?' = page.data.languageCode) =>
    iridUrl('/detail', id, lang);
export const detailUrlNSP = (ids: NSPID[] = page.data.nspids, lang: LC | '?' = page.data.languageCode) =>
    nspidUrl('/detail', ids, lang);
