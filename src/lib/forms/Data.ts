import defaultData from './defaultData';
import {
    CheckboxWidget,
    ChooserWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget
} from '../Widget.svelte.js';
import type { Company, Technician } from '$lib/client/realtime';
import type { ExcelImport } from '$lib/forms/Import';
import { makePlain } from '$lib/translations';
import { dataToRawData, type Raw } from '$lib/forms/Form';

export type Data = {
    ir: {
        typ: DoubleChooserWidget<Data>;
        cislo: InputWidget<Data>;
        cisloBox: InputWidget<Data>;
        chceVyplnitK: MultiCheckboxWidget<Data>;
    };
    tc: {
        nadpis: TitleWidget<Data>;
        poznamka: TextWidget<Data>;
        typ: RadioWidget<Data>;
        model: ChooserWidget<Data>;
        cislo: InputWidget<Data>;
        model2: ChooserWidget<Data>;
        cislo2: InputWidget<Data>;
        model3: ChooserWidget<Data>;
        cislo3: InputWidget<Data>;
        model4: ChooserWidget<Data>;
        cislo4: InputWidget<Data>;
    };
    sol: {
        title: TitleWidget<Data>;
        typ: InputWidget<Data>;
        pocet: InputWidget<Data>;
    };
    koncovyUzivatel: {
        nadpis: TitleWidget<Data>;
        typ: RadioWidget<Data>;
        prijmeni: InputWidget<Data>;
        jmeno: InputWidget<Data>;
        narozeni: InputWidget<Data>;
        nazev: InputWidget<Data>;
        pobocka: InputWidget<Data>;
        ico: InputWidget<Data>;
        telefon: InputWidget<Data>;
        email: InputWidget<Data>;
    };
    bydliste: {
        nadpis: TitleWidget<Data>;
        obec: InputWidget<Data>;
        ulice: InputWidget<Data>;
        psc: InputWidget<Data>;
    };
    mistoRealizace: {
        nadpis: TitleWidget<Data>;
        jakoBydliste: CheckboxWidget<Data, true>;
        obec: InputWidget<Data>;
        ulice: InputWidget<Data>;
        psc: InputWidget<Data>;
    };
    montazka: {
        nadpis: TitleWidget<Data>;
        company: SearchWidget<Data, Company, true>;
        nebo: TextWidget<Data>;
        ico: InputWidget<Data>;
        zastupce: InputWidget<Data>;
        email: InputWidget<Data>;
        telefon: InputWidget<Data>;
    };
    uvedeni: {
        nadpis: TitleWidget<Data>;
        jakoMontazka: CheckboxWidget<Data, true>;
        company: SearchWidget<Data, Company, true>;
        nebo: TextWidget<Data>;
        ico: InputWidget<Data>;
        regulus: SearchWidget<Data, Technician, true>;
        zastupce: InputWidget<Data>;
        email: InputWidget<Data>;
        telefon: InputWidget<Data>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<Data>;
        chce: CheckboxWidget<Data>;
        pristupMa: MultiCheckboxWidget<Data>;
        plati: RadioWidget<Data>;
    };
    ostatni: {
        zodpovednaOsoba: InputWidget<Data>;
        poznamka: InputWidget<Data>;
    };
}

export const newData = () => defaultData();

export const importData: ExcelImport<Raw<Data>> = {
    cells: {
        koncovyUzivatel: {
            typ: { constant: `individual` },
            prijmeni: { address: [3, 2], transform: v => v.split(' ')[0] },
            jmeno: { address: [3, 2], transform: v => v.split(' ').toSpliced(0, 1).join(' ') },
            narozeni: { address: [3, 3] },
            telefon: { address: [2, 7] },
            email: { address: [2, 8] },
        },
        bydliste: {
            ulice: { getData: get => `${get([2, 5])} ${get([6, 5])}` },
            obec: { address: [2, 6] },
            psc: { address: [6, 6] },
        },
        montazka: {
            ico: { address: [2, 13] },
            zastupce: { address: [2, 14] },
            telefon: { address: [2, 16] },
            email: { address: [2, 17] },
        },
        uvedeni: {
            ico: { address: [2, 26] },
            zastupce: { address: [2, 27] },
            email: { address: [2, 28] },
            telefon: { address: [2, 29] },
        },
        tc: {
            typ: {
                address: [2, 33], transform: v => v == 'Vyberte typ' ? null
                    : v.includes('EcoPart') || v.includes('EcoHeat') ? 'groundToWater' : 'airToWater'
            },
            model: { address: [2, 33], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! },
            cislo: { address: [6, 33] },
            model2: { address: [2, 34], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
            cislo2: { address: [6, 34] },
            model3: { address: [2, 35], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
            cislo3: { address: [6, 35] },
            model4: { address: [2, 36], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
            cislo4: { address: [6, 36] },
        },
        ir: {
            typ: {
                getData: get => {
                    const box = get([2, 39]) == 'Vyberte typ' ? null :
                        get([2, 39]).includes('Eco') ? null : get([2, 39]); // EcoZenith, EcoEl
                    const ir = get([2, 41]) == 'Vyberte typ' ? box : get([2, 41]);
                    return {
                        first: makePlain(ir?.split(' ')?.toSpliced(-1, 1)?.join(' ')) ?? null,
                        second: makePlain(ir?.split(' ')?.at(-1)) ?? null,
                    };
                }
            },
            cislo: { getData: get => `${get([6, 41])} ${get([7, 41])}` },
            cisloBox: { address: [6, 39] },
            chceVyplnitK: {
                getData: get => [
                    ...(get([2, 33]) != 'Vyberte typ' ? ['heatPump' as const] : []),
                    ...(get([2, 40]) != 'Vyberte typ' ? ['solarCollector' as const] : []),
                ]
            },
        },
        sol: {
            typ: { address: [2, 40] },
            pocet: { address: [6, 40] },
        },
    },
    defaultData: () => dataToRawData(defaultData()),
    sheet: 'ZADÁNÍ',
};