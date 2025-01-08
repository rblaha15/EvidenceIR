import type { RawData } from './Data';
import { MultiZaskrtavatkova, Nadpisova, p, Pisatkova, Pocitatkova, Radiova, type Raw, Vec, Vybiratkova } from './Vec.svelte';

export type UDSP = {
    protokol: DataSP,
    evidence: RawData,
}

type NahradniDil = {
    nazev: Pisatkova<UDSP>,
    kod: Pisatkova<UDSP>,
    mnozstvi: Pisatkova<UDSP>,
    jednotkovaCena: Pisatkova<UDSP>,
}

export type DataSP = {
    zasah: {
        datum: Pisatkova<UDSP>,
        clovek: Pisatkova<UDSP>,
        doba: Pisatkova<UDSP>,
        druh: MultiZaskrtavatkova<UDSP>,
        nahlasenaZavada: Pisatkova<UDSP>,
        popis: Pisatkova<UDSP>,
    },
    ukony: {
        nadpis: Nadpisova<UDSP>,
        doprava: Pisatkova<UDSP>,
        typPrace: Radiova<UDSP>,
        mnozstviPrace: Pisatkova<UDSP>,
        ukony: MultiZaskrtavatkova<UDSP>,
    },
    nahradniDily: {
        nadpis: Nadpisova<UDSP>,
        pocet: Pocitatkova<UDSP>,
    },
    nahradniDil1: NahradniDil,
    nahradniDil2: NahradniDil,
    nahradniDil3: NahradniDil,
    fakturace: {
        hotove: Vybiratkova<UDSP>,
        komu: Radiova<UDSP>,
        jak: Radiova<UDSP>,
    },
}

const nahradniDil = (zobrazit: (d: UDSP) => boolean): NahradniDil => ({
    nazev: new Pisatkova({ nazev: p`Název položky`, zobrazit, nutne: false }),
    kod: new Pisatkova({ nazev: p`Kód položky`, type: `number`, onError: `wrongNumberFormat`, zobrazit, nutne: false }),
    mnozstvi: new Pisatkova({ nazev: p`Množství`, type: `number`, onError: `wrongNumberFormat`, zobrazit, nutne: false }),
    jednotkovaCena: new Pisatkova({ nazev: p`Jednotková cena`, type: `number`, onError: `wrongNumberFormat`, zobrazit, nutne: false }),
});

export const defaultDataSP = (): DataSP => ({
    zasah: {
        datum: new Pisatkova({ nazev: '', type: 'datetime-local', zobrazit: false }),
        clovek: new Pisatkova({ nazev: p`Jméno technika`, zobrazit: false, nutne: false }),
        doba: new Pisatkova({ nazev: p`Celková doba zásahu (hodin)`, type: 'number', onError: `wrongNumberFormat` }),
        druh: new MultiZaskrtavatkova({
            nazev: p`Druh zásahu`,
            moznosti: [`commissioning`, `sp.yearlyCheck`, `sp.warrantyRepair`, `sp.postWarrantyRepair`, `sp.installationApproval`, `sp.otherType`]
        }),
        nahlasenaZavada: new Pisatkova({ nazev: p`Nahlášená závada`, nutne: false }),
        popis: new Pisatkova({ nazev: p`Popis zásahu`, nutne: false })
    },
    ukony: {
        nadpis: new Nadpisova({ nazev: p`Vyúčtování` }),
        doprava: new Pisatkova({ nazev: p`Doprava (km)`, type: 'number', onError: `wrongNumberFormat` }),
        typPrace: new Radiova({ nazev: p`Typ práce`, moznosti: [`sp.technicalAssistance`, `sp.assemblyWork`], nutne: false }),
        mnozstviPrace: new Pisatkova({
            nazev: p`Počet hodin práce`, type: 'number', onError: `wrongNumberFormat`,
            zobrazit: d => d.protokol.ukony.typPrace.value != null, nutne: d => d.protokol.ukony.typPrace.value != null
        }),
        ukony: new MultiZaskrtavatkova({
            nazev: p`Pracovní úkony (max. 3)`, max: 3, nutne: false, moznosti: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`,
            ]
        }),
    },
    nahradniDily: {
        nadpis: new Nadpisova({ nazev: p`Použité náhradní díly` }),
        pocet: new Pocitatkova({ nazev: p`Počet náhradních dílů`, min: 0, max: 3, vybrano: 0 }),
    },
    nahradniDil1: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 1),
    nahradniDil2: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 2),
    nahradniDil3: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 3),
    fakturace: {
        hotove: new Vybiratkova({ nazev: p`Placeno hotově`, moznosti: ['yes', 'no', 'doNotInvoice'] }),
        komu: new Radiova({
            nazev: p`Komu fakturovat`, moznosti: [p`Investor`, `assemblyCompany`],
            nutne: d => d.protokol.fakturace.hotove.value == 'no', zobrazit: d => d.protokol.fakturace.hotove.value == 'no',
        }),
        jak: new Radiova({
            nazev: p`Fakturovat`, moznosti: [p`Papírově`, p`Elektronicky`],
            nutne: d => d.protokol.fakturace.hotove.value == 'no', zobrazit: d => d.protokol.fakturace.hotove.value == 'no',
        }),
    },
});

export const rawDataSPToDataSP = (toData: DataSP, rawData: RawDataSP) => {
    const d = toData as Record<string, Record<string, Vec<UDSP, any>>>;

    Object.entries(rawData).map(a =>
        a as [keyof DataSP, RawDataSP[keyof RawDataSP]]
    ).forEach(([key1, section]) =>
        Object.entries(section).map(a =>
            a as [string, any]
        ).forEach(([key2, value]) => {
            d[key1][key2].value = value;
        })
    );

    return d as DataSP;
};

export type RawDataSP = Raw<DataSP, UDSP>

export const dataSPToRawDataSP = (data: DataSP): RawDataSP => {
    const DataEntries = Object.entries(data);
    const rawDataEntries = DataEntries.map(([key, subData]) => {
        const subDataEntries = Object.entries(subData) as [string, Vec<UDSP, any>][];
        const rawSubDataEntries = subDataEntries.map(([subKey, vec]) => {
            if (vec.value == undefined) return undefined;
            else return [subKey, vec.value] as const;
        }).filter(it => it != undefined);
        const rawSubData = Object.fromEntries(rawSubDataEntries);
        return [key, rawSubData] as const;
    });
    return Object.fromEntries(rawDataEntries) as RawDataSP;
};