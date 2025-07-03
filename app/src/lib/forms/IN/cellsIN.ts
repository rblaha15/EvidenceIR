import type { ExcelImport } from '$lib/forms/ExcelImport';
import type { Raw } from '$lib/forms/Form';
import { makePlain } from '$lib/translations';
import type { FormIN } from '$lib/forms/IN/formIN';

export const cellsIN: ExcelImport<Raw<FormIN>>['cells'] = {
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
                : v.includes('EcoPart') || v.includes('EcoHeat') ? 'groundToWater' : 'airToWater',
        },
        model: { address: [2, 33], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! as Raw<FormIN>['tc']['model'] },
        cislo: { address: [6, 33] },
        model2: { address: [2, 34], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! as Raw<FormIN>['tc']['model2'] },
        cislo2: { address: [6, 34] },
        model3: { address: [2, 35], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! as Raw<FormIN>['tc']['model3'] },
        cislo3: { address: [6, 35] },
        model4: { address: [2, 36], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! as Raw<FormIN>['tc']['model4'] },
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
                } as Raw<FormIN>['ir']['typ'];
            },
        },
        cislo: { getData: get => `${get([6, 41])} ${get([7, 41])}` },
        cisloBox: { address: [6, 39] },
        chceVyplnitK: {
            getData: get => [
                ...(get([2, 33]) != 'Vyberte typ' ? ['heatPump' as const] : []),
                ...(get([2, 40]) != 'Vyberte typ' ? ['solarCollector' as const] : []),
            ],
        },
    },
    sol: {
        typ: { address: [2, 40] },
        pocet: { address: [6, 40] },
    },
};