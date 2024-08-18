import type { LanguageCode } from "./languages";
import cs from './translations/cs';
import de from './translations/de';
import en from './translations/en';
import sk from './translations/sk';

const translationsMap: TranslationsMap = { cs, en, de, sk };

export default translationsMap

export type Translations = typeof cs

export type Translate = (translations: Translations) => string

type TranslationsMap = {
    [Code in LanguageCode]: Translations
}
export const getTranslations = (code: LanguageCode): Translations => {
    return translationsMap[code]}

type LanguageNames = {
    [Code in LanguageCode]: string
}

type LanguageFlags = {
    [Code in LanguageCode]: (typeof _languageFlags)[Code]
}

export const languageNames: LanguageNames = {
    cs: "čeština",
    en: "English",
    sk: "slovenčina",
    de: "Deutsch",
}

const _languageFlags = {
    cs: "cz",
    en: "eu",
    sk: "sk",
    de: "de",
} as const

export const languageFlags: LanguageFlags = _languageFlags