import { addParsing, type AddParsing, type STemplate, type Template, type TemplateArgs, type Templates } from './helpers/templates';
import type { LanguageCode } from './languages';
import cs from './translations/cs';
import de from './translations/de';
import en from './translations/en';
import sk from '$lib/translations/sk';
import derived, { type Derived } from '$lib/derived';
import './extensions';
import merge from 'lodash.merge';

const translationsMap: PlainTranslationsMap = { cs, en, de, sk };

export type P<S extends string = string> = `p.${S}`;
export const makePlain = <T extends string | undefined | null>(text: T) => text ? p(text) : undefined;
export const p = <T extends string>(s: T): P<T> => `p.${s}`;
export const plainArray = <T extends string>(a: T[]) => a.map(p);
export const removePlain = (ref: string) => ref.slice(2);
export const isPlain = (ref: TranslationReference | TemplateKey) => ref.startsWith('p.');

type Translation = string | Template<(string | number)[]>;

const withGet = (translations: PlainTranslations): Translations => {
    const withParsing = addParsing(translations) as AddParsing<PlainTranslations>;
    const withDerived = merge<AddParsing<PlainTranslations>, Derived>(withParsing, derived(withParsing));
    const get = (ref: TranslationReference | TemplateKey) => ref == '' ? ''
        : isPlain(ref) ? removePlain(ref) : ((ref
            .split('.')
            .reduce<Record<string, unknown> | Translation>((acc, key) =>
                (acc as Record<string, Translation | Record<string, unknown>>)[key], withDerived
            ) as Translation) ?? ref);
    return <Translations> {
        ...withDerived,
        get: ref => ref == null ? null : get(ref),
        refFromTemplate: <T extends (number | string)[]>(ref: TemplateKey, args: TemplateArgs<T>) =>
            `p.${(get(ref) as Template<T>).parseTemplate(args)}`,
    };
};

export type PlainTranslations = typeof cs;

type TemplateKey = RecursiveKeyOf<Templates<PlainTranslations>>;
export type Translations = AddParsing<PlainTranslations> & {
    get: <T extends TranslationReference | TemplateKey | null>(ref: T) => T extends null ? null : T extends TemplateKey ? Template<(string | number)[]> : string;
    refFromTemplate: <K extends TemplateKey>(
        ref: K,
        args: TemplateArgs<AtRecursiveKey<PlainTranslations, K> extends STemplate<infer T> ? T : never>
    ) => TranslationReference
} & Derived;

export const allKeys = <(TranslationReference | TemplateKey)[]> Object.recursiveKeys(cs);

export type TranslationReference = Exclude<
    | RecursiveKeyOf<PlainTranslations & Derived>
    | `p.${string}`
    | '',
    TemplateKey>;

export type Translate<T> = {
    [Code in LanguageCode]: T;
};

type PlainTranslationsMap = Translate<PlainTranslations>;

export const getTranslations = (code: LanguageCode): Translations => withGet(translationsMap[code]);

type LanguageNames = Translate<string>;

export const languageNames: LanguageNames = {
    cs: 'čeština',
    en: 'English',
    sk: 'slovenčina',
    de: 'Deutsch'
};

type RecursiveKeyOf<T extends Record<string, unknown>> = T extends string
    ? T
    : {
        [K in keyof T]: T[K] extends Record<string, unknown>
            ? RecursiveKeyOf<T[K]> extends infer Key
                ? `${K extends string ? K : ''}.${Key extends string ? Key : ''}`
                : never
            : K;
    }[keyof T];

type AtRecursiveKey<T extends Record<string, unknown>, K extends RecursiveKeyOf<T>> =
    K extends `${infer K1}.${infer K2}`
        ? T[K1] extends Record<string, unknown> ?
            K2 extends RecursiveKeyOf<T[K1]> ? AtRecursiveKey<T[K1], K2> : never : never
        : T[K]