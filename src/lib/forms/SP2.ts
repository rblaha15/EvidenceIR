import { type DataSP, defaultDataSP } from '$lib/forms/SP.svelte';
import type { Data } from '$lib/forms/Data';
import { userData, type UserSections } from '$lib/forms/defaultData';
import { InputWidget, p, TitleWidget } from '$lib/Widget.svelte';

export type UDSP2 = {
    protokol: DataSP2,
    d: DataSP2,
}

export type DataSP2 = DataSP & Pick<Data<UDSP2>, UserSections> & {
    system: {
        nadpis: TitleWidget<UDSP2>;
        popis: InputWidget<UDSP2>;
        datumUvedeni: InputWidget<UDSP2>;
    }
};

export const defaultDataSP2 = (): DataSP2 => ({
    ...userData<UDSP2>(),
    system: {
        nadpis: new TitleWidget({ label: p`Instalační a servisní protokol` }),
        popis: new InputWidget({ label: p`Popis systému`, textArea: true, required: true }),
        datumUvedeni: new InputWidget({ label: p`Datum uvedení do provozu`, type: 'date', required: false }),
    },
    ...defaultDataSP(),
})
