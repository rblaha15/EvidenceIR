type KeyOfArray<Array> = Exclude<keyof Array, keyof any[]>

export type STemplate<T extends (number | string)[]> = (readonly [strings: readonly string[], keys: T])

export type Template<T extends (number | string)[]> = STemplate<T> & {
    parseTemplate: (args: {
        [I in KeyOfArray<T> as T[I] extends string | number ? T[I] : never]: string;
    }) => string
};

export const template = <T extends (number | string)[]>(strings: readonly string[], ...keys: T) => {
    return [strings, keys] as STemplate<T>;
};

export const addParsing = <T extends Record<string, string | STemplate<(string | number)[]> | Record<string, any>>>(obj: T): {
    [K in keyof T]: T[K] extends STemplate<infer U> ? Template<U> : T[K];
} => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v instanceof Array ? (() => {
    (v as Template<any>).parseTemplate = (args: Record<string | number, string>) => [
        v[0][0],
        ...v[1].map((key, i) => [(args as Record<string | number, string>)[key], v[0][i + 1]]
        ).flat()
    ].join("");
    return v as typeof v extends STemplate<infer U> ? Template<U> : never;
})() : v instanceof Object ? addParsing(v) : v])) as {
        [K in keyof T]: T[K] extends STemplate<infer U> ? Template<U> : T[K];
    };

export type AddParsing<T extends Record<string, string | STemplate<(string | number)[]> | Record<string, any>>> = {
    [K in keyof T]: T[K] extends STemplate<infer U> ? Template<U> : T[K] extends Record<string, any> ? AddParsing<T[K]> : T[K];
};

