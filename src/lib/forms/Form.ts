import { Widget } from '$lib/forms/Widget.svelte.js';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Form<D = never> = Record<string, Record<string, Widget<D>>>
export type Raw<Q extends Form | Record<string, Widget> | Widget> =
    Q extends Form ? RawForm<Q>
        : Q extends Record<string, Widget> ? RawFormPart<Q>
            : Q extends Widget ? RawWidget<Q>
                : never;

export type RawForm<F extends Form> = {
    [K in keyof F]: RawFormPart<F[K]>
};
export type HiddenWidgets<P extends Record<string, Widget>> = {
    [K in keyof P]: P[K] extends Widget<never, unknown, infer H> ? H extends true ? K : never : never;
}[keyof P];
export type RawFormPart<P extends Record<string, Widget>> = {
    [K in keyof Omit<P, HiddenWidgets<P>>]: RawWidget<P[K]>;
};
export type RawWidget<W extends Widget> =
    W extends Widget<never, infer T, infer H>
        ? H extends true
            ? never
            : T extends readonly (infer RT)[] ? RT[]
                : T extends Record<string, unknown> ? Writeable<T> : T
        : never;


export const dataToRawData = <F extends Form, R extends Raw<F> = Raw<F>>(data: F): R => {
    return data.mapEntries((key, subData) => {
        const rawSubData = subData.mapEntries((subKey, vec) => {
            if (vec == undefined) return undefined;
            if (vec.value == undefined) return undefined;
            if (vec.hideInRawData) return undefined;
            else return [subKey, vec.value] as [keyof R[keyof R], unknown];
        });
        return [key, rawSubData] as [keyof R, R[keyof R]];
    }) as R;
};

export const rawDataToData = <F extends Form>(toData: F, rawData: Raw<F>) => {
    const d = toData;
    (rawData as RawForm<F>).forEachEntry((key1, section) =>
        section.forEachEntry((k, value) => {
            const key2 = k as keyof F[keyof F];
            if (!d[key1]) console.log(`${String(key1)} does not exist in target, skipping`);
            else if (!d[key1][key2]) console.log(`${String(key1)}.${String(key2)} does not exist in target, skipping`);
            else d[key1][key2]._value = value;
        })
    );
    return d;
};
