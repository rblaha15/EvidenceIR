import { addParsing, type AddParsing } from "./helpers/templates";
import type { LanguageCode } from "./languages";
import cs from './translations/cs';
import de from './translations/de';
import en from './translations/en';
import sk from './translations/sk';

const translationsMap: PlainTranslationsMap = { cs, en/* , de, sk */ };

const withGet = (translations: PlainTranslations): Translations => ({
    ...addParsing(translations),
    get: (ref) => ref == '' ? '' : ref.startsWith('PLAIN_') ? ref.slice(6) : ref.split('.').reduce<Record<string, any> | string>((acc, key) => (acc as Record<string, any>)[key], translations) as string ?? ref,
    getN: (ref) => ref == null ? ref : ref == '' ? '' : ref.startsWith('PLAIN_') ? ref.slice(6) : ref.split('.').reduce<Record<string, any> | string>((acc, key) => (acc as Record<string, any>)[key], translations) as string ?? ref,
})

export type PlainTranslations = typeof cs

export type Translations = AddParsing<PlainTranslations> & {
    get: (ref: TranslationReference) => string,
    getN: (ref: TranslationReference | null) => string | null,
}
export type TranslationReference = RecursiveKeyof<PlainTranslations> | `PLAIN_${string}` | ''

type PlainTranslationsMap = {
    [Code in LanguageCode]: PlainTranslations
}
export const getTranslations = (code: LanguageCode): Translations =>
    withGet(translationsMap[code])

type LanguageNames = {
    [Code in LanguageCode]: string
}

export const languageNames: LanguageNames = {
    cs: "čeština",
    en: "English",
/*     sk: "slovenčina",
    de: "Deutsch",
 */}

type RecursiveKeyof<T extends object> = T extends string ? T : {
    //@ts-expect-error
    [K in keyof T]: T[K] extends object ? `${K extends string ? K : ''}.${RecursiveKeyof<T[K]> extends string ? RecursiveKeyof<T[K]> : ''}` : K
}[keyof T]