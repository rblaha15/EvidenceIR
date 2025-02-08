import { Widget } from '$lib/Widget.svelte.js';

export type Form<D> = Record<string, Record<string, Widget<D, unknown>>>
export type Raw<F extends Form<never>> = {
    [K in keyof F]: {
        [K2 in keyof F[K]]: F[K][K2] extends Widget<never, infer T>
            ? T extends undefined
                ? never
                : T
            : never;
    };
};


export const dataToRawData = <F extends Form<never>, R extends Raw<F> = Raw<F>>(data: F): R => {
    return data.mapEntries((key, subData) => {
        const rawSubData = subData.mapEntries((subKey, vec) => {
            if (vec == undefined) return undefined;
            if (vec.value == undefined) return undefined;
            else return [subKey, vec.value] as [keyof R[keyof R], unknown];
        });
        return [key, rawSubData] as [keyof R, R[keyof R]];
    }) as R;
};

export const rawDataToData = <F extends Form<never>>(toData: F, rawData: Raw<F>) => {
    const d = toData;
    rawData.forEachEntry((key1, section) =>
        section.forEachEntry((k, value) => {
            const key2 = k as keyof F[keyof F]
            if (!d[key1]) console.log(`${String(key1)} does not exist in target, skipping`);
            else if (!d[key1][key2]) console.log(`${String(key1)}.${String(key2)} does not exist in target, skipping`);
            else d[key1][key2].value = value;
        })
    );
    return d;
};
