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
import { dataToRawData, type Form, type Raw } from '$lib/forms/Form';

export type UDDA = { d: Data }

export interface UserData<D extends { d: UserData<D> }> extends Form<D> {
    koncovyUzivatel: {
        nadpis: TitleWidget<D>;
        typ: RadioWidget<D>;
        prijmeni: InputWidget<D>;
        jmeno: InputWidget<D>;
        narozeni: InputWidget<D>;
        nazev: InputWidget<D>;
        wrongFormat: TextWidget<D>;
        pobocka: InputWidget<D>;
        ico: InputWidget<D>;
        telefon: InputWidget<D>;
        email: InputWidget<D>;
    };
    bydliste: {
        nadpis: TitleWidget<D>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    mistoRealizace: {
        nadpis: TitleWidget<D>;
        jakoBydliste: CheckboxWidget<D, true>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    montazka: {
        nadpis: TitleWidget<D>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
    uvedeni: {
        nadpis: TitleWidget<D>;
        jakoMontazka: CheckboxWidget<D, true>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        regulus: SearchWidget<D, Technician, true>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
}

export interface Data extends UserData<UDDA>, Form<UDDA> {
    ir: {
        typ: DoubleChooserWidget<UDDA>;
        cislo: InputWidget<UDDA>;
        cisloBox: InputWidget<UDDA>;
        boxType: TextWidget<UDDA>;
        chceVyplnitK: MultiCheckboxWidget<UDDA>;
    };
    tc: {
        nadpis: TitleWidget<UDDA>;
        poznamka: TextWidget<UDDA>;
        typ: RadioWidget<UDDA>;
        model: ChooserWidget<UDDA>;
        cislo: InputWidget<UDDA>;
        model2: ChooserWidget<UDDA>;
        cislo2: InputWidget<UDDA>;
        model3: ChooserWidget<UDDA>;
        cislo3: InputWidget<UDDA>;
        model4: ChooserWidget<UDDA>;
        cislo4: InputWidget<UDDA>;
    };
    sol: {
        title: TitleWidget<UDDA>;
        typ: InputWidget<UDDA>;
        pocet: InputWidget<UDDA>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<UDDA>;
        chce: CheckboxWidget<UDDA>;
        pristupMa: MultiCheckboxWidget<UDDA>;
        plati: RadioWidget<UDDA>;
    };
    ostatni: {
        zodpovednaOsoba: InputWidget<UDDA>;
        poznamka: InputWidget<UDDA>;
    };
}

export const newData = () => defaultData() as Data;

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
    defaultData: () => dataToRawData(newData()),
    sheet: 'ZADÁNÍ',
};