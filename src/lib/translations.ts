import { addParsing, type AddParsing, type Template } from './helpers/templates';
import type { LanguageCode } from './languages';
import cs from './translations/cs';
import de from './translations/de';
import en from './translations/en';
import { createTemplateG } from './Widget.svelte.js';
import derived, { type Derived } from '$lib/derived';
import './extensions';

const translationsMap: PlainTranslationsMap = { cs, en, de /*, sk */ };

export const removePlain = (ref: string) => ref.slice(6);
export const isPlain = (ref: TranslationReference) => ref.startsWith('PLAIN_');

const withGet = (translations: PlainTranslations): Translations => {
    const withParsing = addParsing(translations) as AddParsing<PlainTranslations>;
    const withDerived = {
        ...withParsing,
        ...derived(withParsing)
    } as AddParsing<PlainTranslations> & Derived;
    const get = (ref: TranslationReference) =>
        ref == ''
            ? ''
            : isPlain(ref)
                ? removePlain(ref)
                : ((ref
                    .split('.')
                    .reduce<Record<string, unknown> | string>((acc, key) =>
                        (acc as Record<string, string | Record<string, unknown>>)[key], withDerived
                    ) as string) ?? ref);
    return <Translations> {
        ...withDerived,
        getN: ref => ref == null ? null : get(ref),
        get: ref => ref == null ? null : get(ref),
        getMaybeTemplate: get,
        getT: createTemplateG(
            ({ strings, args }) => ({ strings, args: args.map(get) }),
            a => a
        ),
    };
};

export type PlainTranslations = typeof cs;

export type Translations = AddParsing<PlainTranslations> & {
    get: <T extends TranslationReference | null>(ref: T) => T extends null ? null : string;
    getMaybeTemplate: (ref: TranslationReference) => string | Template<(string | number)[]>;
    getN: (ref: TranslationReference | null) => string | null;
    getT: (strings: TemplateStringsArray, ...args: TranslationReference[]) => string;
} & Derived;

export const allKeys = <TranslationReference[]> Object.recursiveKeys(cs);

export type TranslationReference =
    | RecursiveKeyOf<PlainTranslations & Derived>
    | `PLAIN_${string}`
    | '';

export type Translate<T> = {
    [Code in LanguageCode]: T;
};

type PlainTranslationsMap = Translate<PlainTranslations>;

export const getTranslations = (code: LanguageCode): Translations => withGet(translationsMap[code]);

type LanguageNames = Translate<string>;

export const languageNames: LanguageNames = {
    cs: 'čeština',
    en: 'English',
    //     sk: "slovenčina",
    de: 'Deutsch'
};

type RecursiveKeyOf<T extends object> = T extends string
    ? T
    : {
        [K in keyof T]: T[K] extends object
            ? RecursiveKeyOf<T[K]> extends infer Key
                ? `${K extends string ? K : ''}.${Key extends string ? Key : ''}`
                : never
            : K;
    }[keyof T];