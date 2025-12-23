import {
    ChooserWidget,
    CounterWidget,
    type Get,
    type GetT,
    type HeadingLevel,
    HiddenValueWidget,
    type InlinePdfPreviewData,
    InlinePdfPreviewWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    RadioWithInputWidget,
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
import { dataToRawData, type FormGroupPlus, type FormPlus } from '$lib/forms/Form';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { calculateProtocolPrice } from '$lib/pdf/generators/pdfSP';

const multilineLineLength = 670;
const multilineMaxLength = multilineLineLength * 4;
const inlineMaxLength = 540;

const ctx = browser ? document.createElement('canvas').getContext('2d')! : null!;

const measure = (text: string) => ctx.measureText(text).width;

export const multilineTooLong = (text: string) => text.split('\n').sumBy(line =>
    Math.ceil(measure(line) / multilineLineLength) * multilineLineLength,
) > multilineMaxLength;
export const inlineTooLong = (text: string) => measure(text) > inlineMaxLength;

const sparePart = <D extends GenericFormSP<D>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): FormGroupPlus<SparePartWidgetGroup<D>> => {
    const show = (d: D) => d.nahradniDily.pocet.value >= n;
    const dil = (d: D) => d[`nahradniDil${n}` as const];

    return ({
        _label: new TextWidget({
            show, text: t => t.sp.sparePart(n), class: 'fs-5',
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
                if (d.system.zaruka.value) nd.unitPrice.setValue(d, '0');
                else nd.unitPrice.setValue(d, part?.unitPrice?.let(String) ?? '');
                nd.dil._value = null;
            }, getSearchItem: (i: SparePart, t) => ({
                pieces: [
                    { text: i.code.toString(), width: .08 },
                    { text: i.name, width: .8 },
                    { text: i.unitPrice.roundTo(2).toLocaleString('cs') + t.units.czk, width: .12 },
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
            label: t => t.sp.unitPrice, type: 'number', required: show, show, suffix: t => t.units.czk,
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

const independentOperations = [
    `yearlyHPCheck`, `yearlySOLCheck`, `withoutCode`,
] as const satisfies Operation[];
const operations = [
    ...independentOperations,
    `regulusRoute`, `commissioningTC`, `commissioningSOL`, `commissioningFVE`, `extendedWarranty`,
    `installationApproval`,
] as const satisfies Operation[];
export const invoiceableParts = [
    'transportation' as const, 'work' as const, ...operations,
];

const calculate = <D extends GenericFormSP<D>>(hpCount: Get<D, number>, d: D) =>
    calculateProtocolPrice(dataToRawData(d), hpCount(d));
const notFree = <D extends GenericFormSP<D>>(hpCount: Get<D, number>) =>
    (d: D) => !calculate(hpCount, d).isFree;
const notByCash = <D extends GenericFormSP<D>>(d: D) => d.fakturace.hotove.value == 'no';

export const defaultGenericSP = <D extends GenericFormSP<D>>(
    getPdfData: GetT<D, Omit<InlinePdfPreviewData<D, 'NSP'>, 'type'>>, hpCount: Get<D, number>, titleLevel: HeadingLevel = 2, reduceOperations = false,
): FormPlus<GenericFormSP<D>> => ({
    system: {
        datumUvedeni: new InputWidget({ label: t => t.sp.commissioningDate, type: 'date', required: false }),
        zaruka: new RadioWidget({
            label: t => t.sp.warranty, options: [`warrantyCommon`, `warrantyExtended`], required: false, labels,
            onValueSet: (d, warranty) => {
                if (warranty == 'warrantyCommon') d.fakturace.invoiceParts.setValue(d, invoiceableParts);
                else d.fakturace.invoiceParts.setValue(d, []);
            },
        }),
    },
    zasah: {
        _title: new TitleWidget({ text: t => t.sp.intervention, level: titleLevel }),
        datum: new InputWidget({ label: t => t.sp.interventionDate, type: 'datetime-local' }),
        createdAt: new HiddenValueWidget(),
        changedAt: new HiddenValueWidget(),
        clovek: new InputWidget({ label: t => t.sp.technicianName, show: false }),
        inicialy: new InputWidget({ label: t => t.sp.technicianInitials, show: false, showInXML: false }),
        nahlasenaZavada: new InputWidget({ label: t => t.sp.reportedFault, required: false }),
        _overflowFault: new TextWidget({ text: (t, d) => inlineTooLong(d.zasah.nahlasenaZavada.value) ? t.sp.textTooLong : '' }),
        popis: new InputWidget({ label: t => t.sp.interventionDescription, required: false, textArea: true }),
        _overflowIntervention: new TextWidget({ text: (t, d) => multilineTooLong(d.zasah.popis.value) ? t.sp.textTooLong : '' }),
        interventionDuration: new InputWidget({
            label: t => t.sp.interventionTime,
            type: 'number',
            onError: t => t.wrong.number, suffix: t => t.units.h, required: false,
        }),
    },
    ukony: {
        _title: new TitleWidget({ text: t => t.sp.billing, level: titleLevel }),
        ukony: new MultiCheckboxWidget({
            label: (t, d) => reduceOperations ? t.sp.operations : t.sp.operationsMax(3 - (d.ukony.ukony.value.includes('yearlyHPCheck') && hpCount(d) > 1 ? 1 : 0) - (d.ukony.ukony.value.includes('commissioningTC') && hpCount(d) > 1 ? 1 : 0) + (d.ukony.typPrace.value ? 0 : 1)),
            max: d => d.ukony.typPrace.value ? 3 : 4,
            required: false,
            options: reduceOperations ? independentOperations : operations,
            labels,
            weights: (d, i) =>
                i == 'yearlyHPCheck' && hpCount(d) > 1
                || i == 'commissioningTC' && hpCount(d) > 1
                    ? 2 : 1,
        }),
        typPrace: new RadioWidget({
            label: t => t.sp.workType, required: false, labels, lock: d => d.ukony.ukony.value.sumBy(i => d.ukony.ukony.weights(d, i)) == 4,
            options: [`assemblyWork`, `technicalAssistance`, `assemblyWork12`],
        }),
        doba: new InputWidget({
            label: t => t.sp.billedTime, type: 'number',
            show: d => d.ukony.typPrace.value != null, required: d => d.ukony.typPrace.value != null,
            onError: t => t.wrong.number, suffix: t => t.units.h,
        }),
        doprava: new InputWidget({
            label: t => t.sp.transportation, type: 'number',
            onError: t => t.wrong.number, suffix: t => t.units.km,
        }),
    },
    nahradniDily: {
        _title: new TitleWidget({ text: t => t.sp.usedSpareParts, level: titleLevel }),
        pocet: new CounterWidget({
            label: t => t.sp.sparePartCount, min: 0, max: d => d.fakturace.discount.value ? 7 : 8, chosen: 0,
        }),
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
        _title: new TitleWidget({ text: t => t.sp.invoicing, level: titleLevel }),
        invoiceParts: new MultiCheckboxWidget({
            label: t => t.sp.invoiceParts, options: d => [
                'transportation' as const,
                ...d.ukony.typPrace.value ? ['work' as const] : [],
                ...d.ukony.ukony.value,
            ], labels, required: false,
        }),
        discount: new InputWidget({
            label: t => t.sp.discountNoTax, type: 'number', onError: t => t.wrong.number, suffix: t => t.units.czk, required: false,
            lock: d => d.nahradniDily.pocet.value == 8,
        }),
        _price: new TextWidget({ text: (t, d) => t.sp.price(calculate(hpCount, d)), class: 'fs-5' }),
        hotove: new ChooserWidget({
            label: t => t.sp.paidInCash, options: ['yes', 'no'] as ('yes' | 'no' | 'doNotInvoice')[], labels, chosen: 'no',
            required: notFree(hpCount), show: notFree(hpCount),
        }),
        komu: new RadioWithInputWidget({
            label: t => t.sp.whoToInvoice, labels, otherLabel: t => t.sp.crnOrName,
            options: ['investor', `assemblyCompany`, `commissioningCompany`, 'otherCompany'],
            required: d => notByCash(d) && notFree(hpCount)(d), show: d => notByCash(d) && notFree(hpCount)(d),
        }),
        jak: new RadioWidget({
            label: t => t.sp.send, options: ['onPaper', 'electronically'], labels,
            required: d => notByCash(d) && notFree(hpCount)(d), show: d => notByCash(d) && notFree(hpCount)(d),
        }),
    },
    other: {
        _title: new TitleWidget({
            text: t => t.pdf.documentPreview, showInXML: false, level: 2,
        }),
        preview: new InlinePdfPreviewWidget({
            pdfData: (t, d) => ({
                type: 'NSP',
                ...getPdfData(t, d),
            }),
        }),
    },
});

export default (): FormSP => defaultGenericSP((t, d) => ({
    data: generalizeServiceProtocol(d.evidence, d.raw, t),
    form: d.form,
    pumpCount: cascadePumps(d.evidence).length,
}), d => cascadePumps(d.evidence).length);