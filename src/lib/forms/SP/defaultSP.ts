import {
    ChooserWidget,
    CounterWidget,
    type GetT,
    type HeadingLevel,
    type InlinePdfPreviewData,
    InlinePdfPreviewWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import { type SparePart, sparePartsList } from '$lib/client/realtime';
import type { FormSP, GenericFormSP, Operation, SparePartWidgetGroup } from '$lib/forms/SP/formSP.svelte';
import type { Translations } from '$lib/translations';
import { browser } from '$app/environment';
import { derived } from 'svelte/store';
import { generalizeServiceProtocol } from '$lib/pdf/pdf';

const multilineLineLength = 670;
const multilineMaxLength = multilineLineLength * 4;
const inlineMaxLength = 540;

const ctx = browser ? document.createElement('canvas').getContext('2d')! : null!;

const measure = (text: string) => ctx.measureText(text).width;

export const multilineTooLong = (text: string) => text.split('\n').sumBy(line =>
    Math.ceil(measure(line) / multilineLineLength) * multilineLineLength,
) > multilineMaxLength;
export const inlineTooLong = (text: string) => measure(text) > inlineMaxLength;

const sparePart = <D extends GenericFormSP<D>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): SparePartWidgetGroup<D> => {
    const show = (d: D) => d.nahradniDily.pocet.value >= n;
    const dil = (d: D) => d[`nahradniDil${n}` as const];

    return ({
        label: new TextWidget({
            show, text: t => t.sp.sparePart({ n: `${n}` }), class: 'fs-5',
        }),
        dil: new SearchWidget({
            items: derived(sparePartsList, $sparePartsList =>
                $sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) satisfies SparePart),
            ),
            required: false, show, hideInRawData: true, label: t => t.sp.searchItem,
            onValueSet: (d, part) => {
                const nd = dil(d);
                nd.code.setValue(d, part?.code?.let(String) ?? '');
                nd.name.setValue(d, part?.name ?? '');
                nd.unitPrice.setValue(d, part?.unitPrice?.let(String) ?? '');
                nd.dil._value = null;
            }, getSearchItem: (i: SparePart) => ({
                pieces: [
                    { text: i.code.toString(), width: .08 },
                    { text: i.name, width: .8 },
                    { text: i.unitPrice.roundTo(2).toLocaleString('cs') + ' Kč', width: .12 },
                ] as const,
            }), showInXML: false,
        }),
        name: new InputWidget({
            label: t => t.sp.name, required: show, show,
        }),
        code: new InputWidget({
            label: t => t.sp.code, type: 'number', required: false, show,
        }),
        unitPrice: new InputWidget({
            label: t => t.sp.unitPrice, type: 'number', required: show, show, suffix: 'Kč',
        }),
        warehouse: new InputWidget({
            label: t => t.sp.warehouse, required: false, show,
        }),
        mnozstvi: new InputWidget({
            label: t => t.sp.amount, type: `number`, onError: t => t.wrong.number, text: '1',
            required: show, show,
        }),
    });
};

const labels = <A extends Translations['sp']>(t: Translations): Pick<A, keyof Translations['sp']> => t.sp;

const operations = [
    `regulusRoute`, `commissioningTC`, `commissioningSOL`, `commissioningFVE`, `yearlyHPCheck`,
    `yearlySOLCheck`, `extendedWarranty`, `installationApproval`, `withoutCode`,
] as const satisfies Operation[];
export const invoiceableParts = [
    'transportation' as const, 'work' as const, ...operations,
];
export const defaultGenericSP = <D extends GenericFormSP<D>>(
    getPdfData: GetT<D, InlinePdfPreviewData<'NSP'>>, titleLevel: HeadingLevel = 2,
): GenericFormSP<D> => ({
    zasah: {
        nadpis: new TitleWidget({ text: t => t.sp.intervention, level: titleLevel }),
        datum: new InputWidget({ label: t => t.sp.interventionDate, type: 'datetime-local' }),
        datumUvedeni: new InputWidget({ label: t => t.sp.commissioningDate, type: 'date', required: false }),
        clovek: new InputWidget({ label: t => t.sp.technicianName, show: false }),
        inicialy: new InputWidget({ label: t => t.sp.technicianInitials, show: false, showInXML: false }),
        zaruka: new RadioWidget({ label: t => t.sp.warranty, options: [`warrantyCommon`, `warrantyExtended`], required: false, labels }),
        nahlasenaZavada: new InputWidget({ label: t => t.sp.reportedFault, required: false }),
        overflowFault: new TextWidget({ text: (t, d) => inlineTooLong(d.zasah.nahlasenaZavada.value) ? t.sp.textTooLong : '' }),
        popis: new InputWidget({ label: t => t.sp.interventionDescription, required: false, textArea: true }),
        overflowIntervention: new TextWidget({ text: (t, d) => multilineTooLong(d.zasah.popis.value) ? t.sp.textTooLong : '' }),
    },
    ukony: {
        nadpis: new TitleWidget({ text: t => t.sp.billing, level: titleLevel }),
        doprava: new InputWidget({
            label: t => t.sp.transportation,
            type: 'number',
            onError: t => t.wrong.number,
            suffix: t => t.units.km,
        }),
        typPrace: new RadioWidget({
            label: t => t.sp.workType,
            options: [`assemblyWork`, `technicalAssistance`, `technicalAssistance12`],
            required: false,
            labels,
        }),
        ukony: new MultiCheckboxWidget({
            label: t => t.sp.operations, max: 3, required: false, options: operations, labels,
        }),
        doba: new InputWidget({
            label: (t, d) => d.ukony.typPrace.value != null ? t.sp.billedTime : t.sp.interventionTime,
            type: 'number',
            onError: t => t.wrong.number,
            suffix: t => t.units.h,
        }),
    },
    nahradniDily: {
        nadpis: new TitleWidget({ text: t => t.sp.usedSpareParts, level: titleLevel }),
        pocet: new CounterWidget({ label: t => t.sp.sparePartCount, min: 0, max: 8, chosen: 0 }),
    },
    nahradniDil1: sparePart(1),
    nahradniDil2: sparePart(2),
    nahradniDil3: sparePart(3),
    nahradniDil4: sparePart(4),
    nahradniDil5: sparePart(5),
    nahradniDil6: sparePart(6),
    nahradniDil7: sparePart(7),
    nahradniDil8: sparePart(8),
    fakturace: {
        nadpis: new TitleWidget({ text: t => t.sp.invoicing, level: titleLevel }),
        hotove: new ChooserWidget({ label: t => t.sp.paidInCash, options: ['yes', 'no', 'doNotInvoice'], labels }),
        komu: new RadioWidget({
            label: t => t.sp.whoToInvoice, options: ['investor', `assemblyCompany`], labels,
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: t => t.sp.invoice, options: ['onPaper', 'electronically'], labels,
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        invoiceParts: new MultiCheckboxWidget({
            label: t => t.sp.invoiceParts, options: d => [
                'transportation' as const,
                ...d.ukony.typPrace.value ? ['work' as const] : [],
                ...d.ukony.ukony.value,
            ], labels, required: false, chosen: invoiceableParts,
        }),
    },
    other: {
        title: new TitleWidget({
            text: t => t.pdf.documentPreview, showInXML: false, level: 2,
        }),
        preview: new InlinePdfPreviewWidget({
            pdfData: getPdfData,
        }),
    },
});

export default (): FormSP => ({
    ...defaultGenericSP((t, d) => ({
        type: 'NSP',
        data: generalizeServiceProtocol(d.evidence, d.raw, d.uvedeniTC, t),
    })),
})