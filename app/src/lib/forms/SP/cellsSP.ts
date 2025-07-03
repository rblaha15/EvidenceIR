import type { ExcelImport } from '$lib/forms/ExcelImport';
import type { Raw } from '$lib/forms/Form';
import { range } from '$lib/extensions';
import { makePlain, p } from '$lib/translations';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';

const cellsSparePart = (i: 0 | 1 | 2) => ({
    name: { address: [1, 43 + i] },
    code: { address: [6, 43 + i] },
    unitPrice: { address: [12, 43 + i] },
    mnozstvi: { address: [9, 43 + i] },
}) satisfies ExcelImport<Raw<FormSP>>['cells']['nahradniDil1'];

export const cellsSP: ExcelImport<Raw<FormSP>>['cells'] = {
    zasah: {
        datum: {
            address: [14, 1],
            transform: v => v.split('-')[0].split('/').map(n => n.padStart(2, '0')).join('-') + 'T' + v.split('-')[1] + ':00',
        },
        clovek: { address: [11, 21] },
        inicialy: { address: [13, 1] },
        popis: { address: [1, 30] },
        nahlasenaZavada: { address: [5, 28] },
    },
    ukony: {
        doprava: { address: [9, 38] },
        doba: { address: [9, 39] },
        typPrace: { address: [1, 39], transform: v => v.includes('pomoc') ? `sp.technicalAssistance` : 'sp.assemblyWork' },
        ukony: {
            getData: get => [get([1, 40]), get([1, 41]), get([1, 42])]
                .mapNotUndefined(u => ([
                    ['Route', `sp.regulusRoute`] as const,
                    ['Uvedení TČ', `sp.commissioningTC`] as const,
                    ['Uvedení SOL', `sp.commissioningSOL`] as const,
                    ['kontrola TČ', `sp.yearlyHPCheck`] as const,
                    ['kontrola SOL', `sp.yearlySOLCheck`] as const,
                    ['Záruka', `sp.extendedWarranty`] as const,
                    ['instalace', `sp.installationApproval`] as const,
                ] as const).find(([s]) => u.includes(s))?.[1]),
        },
    },
    nahradniDil1: cellsSparePart(0),
    nahradniDil2: cellsSparePart(1),
    nahradniDil3: cellsSparePart(2),
    nahradniDily: {
        pocet: {
            getData: get => range(3).filter(i => get(cellsSparePart(i as 0 | 1 | 2).name.address)).length,
        },
    },
    fakturace: {
        hotove: { address: [18, 43], transform: v => v == 'ANO' ? 'yes' : v == 'NE' ? 'no' : 'doNotInvoice' },
        komu: { address: [18, 45], transform: v => v == 'Odběratel' ? p('Investor') : 'assemblyCompany' },
        jak: { address: [18, 46], transform: v => makePlain(v[0].toUpperCase() + v.slice(1) as 'Papírově' | 'Elektronicky')! },
    },
};