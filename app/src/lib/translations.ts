import { addParsing, type AddParsing } from "./helpers/templates";
import type { LanguageCode } from "./languages";
import cs from './translations/cs';
import de from './translations/de';
import en from './translations/en';
import sk from './translations/sk';
import { createTemplateG } from "./Vec.svelte";

const translationsMap: PlainTranslationsMap = { cs, en, de/*, sk */ };

const withGet = (translations: PlainTranslations): Translations => {
    const get = (ref: TranslationReference) => ref == '' ? '' : ref.startsWith('PLAIN_') ? ref.slice(6) : ref.split('.').reduce<Record<string, any> | string>((acc, key) => (acc as Record<string, any>)[key], translations) as string ?? ref
    return {
        ...addParsing(translations),
        get,
        getN: (ref) => ref == null ? ref : get(ref),
        getT: createTemplateG(({ strings, args }) => ({ strings, args: args.map(get) }), a => a)
    }
}

export type PlainTranslations = typeof cs

export type Translations = AddParsing<PlainTranslations> & {
    get: (ref: TranslationReference) => string,
    getN: (ref: TranslationReference | null) => string | null,
    getT: (strings: TemplateStringsArray, ...args: TranslationReference[]) => string,
}
export type TranslationReference = RecursiveKeyof<PlainTranslations> | `PLAIN_${string}` | ''

export type Translate<T> = {
    [Code in LanguageCode]: T
}

type PlainTranslationsMap = Translate<PlainTranslations>

export const getTranslations = (code: LanguageCode): Translations =>
    withGet(translationsMap[code])

type LanguageNames = Translate<string>

export const languageNames: LanguageNames = {
    cs: "čeština",
    en: "English",
//     sk: "slovenčina",
    de: "Deutsch",
}

type RecursiveKeyof<T extends object> = T extends string ? T : {
    //@ts-expect-error
    [K in keyof T]: T[K] extends object ? `${K extends string ? K : ''}.${RecursiveKeyof<T[K]> extends string ? RecursiveKeyof<T[K]> : ''}` : K
}[keyof T]