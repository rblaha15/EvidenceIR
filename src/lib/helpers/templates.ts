import isString from 'lodash.isstring';

type KeyOfArray<Array> = Exclude<keyof Array, keyof unknown[]>

export type STemplate<T extends (number | string)[]> = (readonly [strings: readonly string[], keys: T])

export type TemplateArgs<T extends (number | string)[]> = {
    [I in KeyOfArray<T> as T[I] extends string | number ? T[I] : never]: string;
};
export type Template<T extends (number | string)[]> = STemplate<T> & {
    parseTemplate: (args: TemplateArgs<T>) => string
};

export const template = <T extends (number | string)[]>(strings: readonly string[], ...keys: T) =>
    [strings, keys] as STemplate<T>;

type TranslationEntry = string | STemplate<(string | number)[]> | Record<string, unknown>
type Translations = Record<string, TranslationEntry>

const addParsingToTemplate = <T extends (string | number)[]>(v: STemplate<T>) => {
    const t = v as Template<T>;
    const [strings, keys] = t;
    t.parseTemplate = (args: TemplateArgs<T>) => {
        const argArray = keys.map(key => (args as Record<string | number, string>)[key]);
        return ['', ...argArray].zip(strings).flat().join('');
    };
    return t as typeof v extends STemplate<infer U> ? Template<U> : never;
};

export const addParsing = <T extends Translations>(obj: T): AddParsing<T> =>
    obj.mapValues((_, v: TranslationEntry) => {
            return isString(v)
                ? v
                : v instanceof Array
                    ? addParsingToTemplate(v)
                    : addParsing(v as Translations);
        }
    ) as AddParsing<T>;

export type AddParsing<T extends Translations> = {
    [K in keyof T]: T[K] extends STemplate<infer U> ? Template<U> : T[K] extends Translations ? AddParsing<T[K]> : T[K];
};

export type Templates<T extends Translations> = {
    [K in keyof T]: T[K] extends STemplate<(string | number)[]> ? true : T[K] extends Translations ? Templates<T[K]> : never;
};