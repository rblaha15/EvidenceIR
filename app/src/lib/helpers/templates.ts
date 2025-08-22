import isString from 'lodash.isstring';
import cs from '$lib/translations/cs';

export type STemplate<T extends (number | string)[]> = [strings: readonly string[], keys: T]

export type TemplateArgs<T extends (number | string)[]> = {
    [I in T[number]]: string;
};
export type Template<T extends (number | string)[]> = {
    strings: readonly string[]
    keys: T
    (args: TemplateArgs<T>): string
};

export const template = <T extends (number | string)[]>(strings: readonly string[], ...keys: T) =>
    [strings, keys] as STemplate<T>;

type TranslationEntry = string | STemplate<(string | number)[]> | Record<string, unknown> | ((...args: unknown[]) => string);
type Translations = Record<string, TranslationEntry>

const addParsingToTemplate = <T extends (string | number)[]>(v: STemplate<T>) => {
    const [strings, keys] = v;
    const parseTemplate = (args: TemplateArgs<T>) => {
        const argArray = keys.map(key => (args as Record<string | number, string>)[key]);
        return ['', ...argArray].zip(strings).flat().join('');
    };
    const t = parseTemplate as Template<T>;
    t.strings = strings;
    t.keys = keys;
    return t as typeof v extends STemplate<infer U> ? Template<U> : never;
};

export const addParsing = <T extends Translations>(obj: T): AddParsing<T> =>
    obj.mapValues((_, v: TranslationEntry) => {
        return isString(v) || v instanceof Function
            ? v
            : v instanceof Array
                ? addParsingToTemplate(v)
                : addParsing(v as Translations);
    }) as AddParsing<T>;

export type AddParsing<T extends Translations> = {
    [K in keyof T]: T[K] extends STemplate<infer U> ? Template<U> : T[K] extends Translations ? AddParsing<T[K]> : T[K];
};

export type Templates<T extends Translations> = {
    [K in keyof T]: T[K] extends STemplate<(string | number)[]> ? true : T[K] extends Translations ? Templates<T[K]> : never;
};