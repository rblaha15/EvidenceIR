import cs from '$lib/translations/cs';
import de from '$lib/translations/de';
import en from '$lib/translations/en';
import sk from '$lib/translations/sk';
import '$lib/extensions';
import { addParsing, type AddParsing } from '$lib/helpers/templates';
import type { Untranslatable } from '$lib/translations/untranslatables';
import type { LanguageCode } from '$lib/languageCodes';

export const get = <I extends string>(l: Record<Exclude<I, Untranslatable>, string | undefined>, v: I | null): string =>
    v ? l[v] ?? v ?? '' : ''

export type Translate<T> = {
    [Code in LanguageCode]: T;
};

export type PlainTranslations = typeof cs;

type PlainTranslationsMap = Translate<PlainTranslations>;
const translationsMap: PlainTranslationsMap = { cs, en, de, sk };

export type Translations = AddParsing<PlainTranslations>

export const getTranslations = (code: LanguageCode): Translations => addParsing(translationsMap[code]);

type LanguageNames = Translate<string>;

export const languageNames: LanguageNames = {
    cs: 'čeština',
    en: 'English',
    sk: 'slovenčina',
    de: 'Deutsch',
};