import type { PdfImport } from '$lib/forms/PdfImport';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { dateToISO } from '$lib/helpers/date';
import { getTranslations } from '$lib/translations';
import { range } from '$lib/extensions';
import { fieldsParts } from '$lib/pdf/generators/pdfSP';

export const sparePartFields = (i: number): PdfImport<Raw<FormNSP>>['fields']['nahradniDil1'] => ({
    name: { type: 'text', name: `Text${fieldsParts.name + i}` },
    code: { type: 'text', name: `Text${fieldsParts.code + i}` },
    unitPrice: { type: 'text', name: `Text${fieldsParts.price + i}`, transform: a => a.split(' ')[0] },
    warehouse: { type: 'text', name: `Text${fieldsParts.warehouse + i}` },
    mnozstvi: { type: 'text', name: `Text${fieldsParts.amount + i}`, transform: a => a.split(' ')[0] },
});

// noinspection JSNonASCIINames
export const fieldsNSP: PdfImport<Raw<FormNSP>>['fields'] = {
    koncovyUzivatel: {
        jmeno: { type: 'text', name: 'Text2', transform: a => a.split(' ').slice(1).join(' ') },
        prijmeni: { type: 'text', name: 'Text2', transform: a => a.split(' ')[0] },
        nazev: { type: 'text', name: 'Text2' },
        narozeni: { type: 'text', name: 'Text3' },
        ico: { type: 'text', name: 'Text3' },
        telefon: { type: 'text', name: 'Text5' },
        email: { type: 'text', name: 'Text6' },
    },
    bydliste: {
        ulice: { type: 'text', name: 'Text4' },
    },
    montazka: {
        ico: { type: 'text', name: 'Text8' },
        zastupce: { type: 'text', name: 'Text9' },
        telefon: { type: 'text', name: 'Text11' },
        email: { type: 'text', name: 'Text12' },
    },
    uvedeni: {
        ico: { type: 'text', name: 'Text8' },
        zastupce: { type: 'text', name: 'Text9' },
        telefon: { type: 'text', name: 'Text11' },
        email: { type: 'text', name: 'Text12' },
    },
    mistoRealizace: {
        ulice: { type: 'text', name: 'Text13' },
    },
    system: {
        popis: { type: 'text', name: 'Text14' },
        datumUvedeni: { type: 'text', name: 'Text16', transform: a => a ? dateToISO(a) : '' },
        zaruka: {
            getData: g =>
                g('checkbox', 'Zaškrtávací pole28') ? 'warrantyCommon'
                    : g('checkbox', 'Zaškrtávací pole29') ? 'warrantyExtended'
                        : null,
        },
    },
    zasah: {
        datum: { type: 'text', name: 'Text15', transform: a => a ? a.replace('-', 'T').replaceAll('/', '-') : '' },
        clovek: { type: 'text', name: 'Text17', transform: a => a.trim() },
        inicialy: { type: 'text', name: 'Text1', transform: a => a.split(' ')[0] },
        nahlasenaZavada: { type: 'text', name: 'Text19' },
        popis: { type: 'text', name: 'Text20' },
        interventionDuration: { type: 'text', name: 'Text87', transform: a => a.split(' ')[0] },
    },
    ukony: {
        ukony: {
            getData: getValue => ['Kombinované pole33', 'Kombinované pole34', 'Kombinované pole35']
                .map(f => ({
                    'RegulusRoute': 'regulusRoute',
                    'Prodloužená záruka 10 let': 'extendedWarranty',
                    'Uvedení tč do provozu': 'commissioningTC',
                    'Uvedení do provozu dalších TČ v kaskádě': undefined,
                    'Uvedení sol do provozu': 'commissioningSOL',
                    'Uvedení FVE do provozu': 'commissioningFVE',
                    'Roční kontrola tč': 'yearlyHPCheck',
                    'Roční kontrola dalších TČ v kaskádě': undefined,
                    'Roční kontrola sol': 'yearlySOLCheck',
                    'Obchodní činnost': 'withoutCode',
                    'Schválení instalace': 'installationApproval',
                } as const)[getValue('dropdown', f)])
                .filterNotUndefined(),
        },
        typPrace: {
            type: 'dropdown', name: 'Kombinované pole32', transform: a => {
                const cs = getTranslations('cs');
                return (['technicalAssistance', 'assemblyWork', 'technicalAssistance12'] as const)
                    .associateBy(v => cs.sp[v])[a];
            },
        },
        doba: { type: 'text', name: 'Text23', transform: a => a.split(' ')[0] },
        doprava: { type: 'text', name: 'Text21', transform: a => a.split(' ')[0] },
    },
    nahradniDily: {
        pocet: {
            getData: getValue => range(8)
                .filter(i => getValue('text', `Text${fieldsParts.name + i}`)).length,
        },
    },
    nahradniDil1: sparePartFields(0),
    nahradniDil2: sparePartFields(1),
    nahradniDil3: sparePartFields(2),
    nahradniDil4: sparePartFields(3),
    nahradniDil5: sparePartFields(4),
    nahradniDil6: sparePartFields(5),
    nahradniDil7: sparePartFields(6),
    nahradniDil8: sparePartFields(7),
    fakturace: {
        hotove: {
            type: 'text', name: 'Text39', transform: a => a
                .trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
                .let(t => t == 'ano' ? 'yes' : t == 'ne' ? 'no' : null),
        },
        komu: {
            type: 'text', name: 'Text41', transform: a => a
                .trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
                .let(t => t == 'investor' ? { chosen: 'investor', text: '' }
                    : t == 'montazni firma' ? { chosen: 'assemblyCompany', text: '' }
                        : t == 'firma uvadejici do provozu' || t == 'uvadec' ? { chosen: 'commissioningCompany', text: '' }
                            : { chosen: null, text: t }),
        },
        jak: {
            type: 'text', name: 'Text42', transform: a => a
                .trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
                .let(t => t == 'elektronicky' ? 'electronically' : t == 'papirove' ? 'onPaper' : null),
        },
    },
};