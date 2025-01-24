import defaultData from './defaultData';
import {
    DvojVybiratkova,
    MultiZaskrtavatkova,
    Nadpisova,
    Pisatkova,
    Radiova,
    type Raw,
    SearchWidget,
    Textova,
    Vec,
    Vybiratkova,
    Zaskrtavatkova
} from './Vec.svelte';
import type { Company, Technician } from '$lib/client/realtime';

export type Data = {
    ir: {
        typ: DvojVybiratkova<Data>;
        cislo: Pisatkova<Data>;
        cisloBox: Pisatkova<Data>;
        chceVyplnitK: MultiZaskrtavatkova<Data>;
    };
    tc: {
        nadpis: Nadpisova<Data>;
        poznamka: Textova<Data>;
        typ: Radiova<Data>;
        model: Vybiratkova<Data>;
        cislo: Pisatkova<Data>;
        model2: Vybiratkova<Data>;
        cislo2: Pisatkova<Data>;
        model3: Vybiratkova<Data>;
        cislo3: Pisatkova<Data>;
        model4: Vybiratkova<Data>;
        cislo4: Pisatkova<Data>;
    };
    sol: {
        title: Nadpisova<Data>;
        typ: Pisatkova<Data>;
        pocet: Pisatkova<Data>;
    };
    koncovyUzivatel: {
        nadpis: Nadpisova<Data>;
        typ: Radiova<Data>;
        prijmeni: Pisatkova<Data>;
        jmeno: Pisatkova<Data>;
        narozeni: Pisatkova<Data>;
        nazev: Pisatkova<Data>;
        pobocka: Pisatkova<Data>;
        ico: Pisatkova<Data>;
        telefon: Pisatkova<Data>;
        email: Pisatkova<Data>;
    };
    bydliste: {
        nadpis: Nadpisova<Data>;
        obec: Pisatkova<Data>;
        ulice: Pisatkova<Data>;
        psc: Pisatkova<Data>;
    };
    mistoRealizace: {
        nadpis: Nadpisova<Data>;
        jakoBydliste: Zaskrtavatkova<Data>;
        obec: Pisatkova<Data>;
        ulice: Pisatkova<Data>;
        psc: Pisatkova<Data>;
    };
    montazka: {
        nadpis: Nadpisova<Data>;
        company: SearchWidget<Data, Company>;
        nebo: Textova<Data>;
        ico: Pisatkova<Data>;
        zastupce: Pisatkova<Data>;
        email: Pisatkova<Data>;
        telefon: Pisatkova<Data>;
    };
    uvedeni: {
        nadpis: Nadpisova<Data>;
        jakoMontazka: Zaskrtavatkova<Data>;
        company: SearchWidget<Data, Company>;
        nebo: Textova<Data>;
        ico: Pisatkova<Data>;
        regulus: SearchWidget<Data, Technician>;
        zastupce: Pisatkova<Data>;
        email: Pisatkova<Data>;
        telefon: Pisatkova<Data>;
    };
    vzdalenyPristup: {
        nadpis: Nadpisova<Data>;
        chce: Zaskrtavatkova<Data>;
        pristupMa: MultiZaskrtavatkova<Data>;
        plati: Radiova<Data>;
    };
    ostatni: {
        zodpovednaOsoba: Pisatkova<Data>;
        poznamka: Pisatkova<Data>;
    };
}

export const rawDataToData = (toData: Data, rawData: RawData) => {
    const d = toData as GeneralData;

    Object.entries(rawData).map(a =>
        a as [keyof Data, RawData[keyof RawData]]
    ).forEach(([key1, section]) =>
        Object.entries(section).map(a =>
            a as [string, unknown]
        ).forEach(([key2, value]) => {
            if (d[key1] == undefined) return;
            if (d[key1][key2] == undefined) d[key1][key2] = (defaultData()[key1] as GeneralData[string])[key2];
            else d[key1][key2].value = value;
        })
    );

    return d as Data;
};

export const newData = () => defaultData();

export type RawData = Raw<Data>
export type GeneralData = Record<string, Record<string, Vec<Data, unknown>>>

export const dataToRawData = (data: Data): RawData => {
    const dataEntries = Object.entries(data);
    const rawDataEntries = dataEntries.map(([key, subData]) => {
        const subDataEntries = Object.entries(subData) as [string, Vec<Data, unknown>][];
        const rawSubDataEntries = subDataEntries.map(([subKey, vec]) => {
            if (vec == undefined) return undefined;
            if (vec.value == undefined) return undefined;
            else return [subKey, vec.value] as const;
        }).filter(it => it != undefined);
        const rawSubData = Object.fromEntries(rawSubDataEntries);
        return [key, rawSubData] as const;
    });
    return Object.fromEntries(rawDataEntries) as RawData;
};

