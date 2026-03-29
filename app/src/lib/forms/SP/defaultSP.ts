import {
    type Get,
    type GetT,
    type HeadingLevel,
    type InlinePdfPreviewData,
    newChooserWidget,
    newCounterWidget,
    newHiddenValueWidget,
    newInlinePdfPreviewWidget,
    newInputWidget,
    newMultiCheckboxWidget,
    newRadioWidget,
    newRadioWithInputWidget,
    newSearchWidget,
    newTextWidget,
    newTitleWidget,
} from '$lib/forms/Widget';
import { type SparePart, sparePartsList } from '$lib/client/realtime';
import type { FormSP, GenericContextSP, GenericFormSP, Operation, SparePartWidgetGroup } from '$lib/forms/SP/formSP.svelte';
import type { Translations } from '$lib/translations';
import { browser } from '$app/environment';
import { derived } from 'svelte/store';
import { generalizeServiceProtocol } from '$lib/pdf/pdf';
import { type FormGroupPlus, type FormPlus } from '$lib/forms/Form';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { calculateProtocolPrice, newPrices } from '$lib/pdf/generators/pdfSP';
import { defaultGenericSZ } from './defaultSZ';

const multilineLineLength = 670;
const multilineMaxLength = multilineLineLength * 4;
const inlineMaxLength = 540;

const ctx = browser ? document.createElement('canvas').getContext('2d')! : null!;

const measure = (text: string) => ctx.measureText(text).width;

export const multilineTooLong = (text: string) => text.split('\n').sumBy(line =>
    Math.ceil(measure(line) / multilineLineLength) * multilineLineLength,
) > multilineMaxLength;
export const inlineTooLong = (text: string) => measure(text) > inlineMaxLength;

const sparePart = <C extends GenericContextSP<C>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): FormGroupPlus<SparePartWidgetGroup<C>> => {
    const show = (c: C) => c.v.nahradniDily.pocet >= n;
    const dil = (c: C) => c.v[`nahradniDil${n}` as const];

    return ({
        _label: newTextWidget({
            show, text: t => t.sp.sparePart(n), class: 'fs-5',
        }),
        dil: newSearchWidget({
            items: derived(sparePartsList, $sparePartsList =>
                $sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) satisfies SparePart),
            ),
            required: false, show, hideInRawData: true, label: t => t.sp.searchItem,
            onValueSet: (c, part) => {
                const nd = dil(c);
                nd.code = part?.code?.let(String) ?? '';
                nd.name = part?.name ?? '';
                if (c.v.system.zaruka) nd.unitPrice = '0';
                else nd.unitPrice = part?.unitPrice?.let(String) ?? '';
                nd.dil = null;
            }, getSearchItem: (i: SparePart, t) => ({
                pieces: [
                    { text: i.code.toString(), width: .08 },
                    { text: i.name, width: .8 },
                    { text: i.unitPrice.roundTo(2).toLocaleString('cs') + t.units.czk, width: .12 },
                ] as const,
            }), showInXML: false,
        }),
        name: newInputWidget({
            label: t => t.sp.name, required: show, show,
        }),
        code: newInputWidget({
            label: t => t.sp.code, type: 'number', required: false, show,
        }),
        unitPrice: newInputWidget({
            label: t => t.sp.unitPrice, type: 'number', required: show, show, suffix: t => t.units.czk,
        }),
        warehouse: newInputWidget({
            label: t => t.sp.warehouse, required: false, show,
        }),
        mnozstvi: newInputWidget({
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

const calculate = <C extends GenericContextSP<C>>(hpCount: Get<C, number>, c: C) =>
    calculateProtocolPrice(c.v, hpCount(c));
const notFree = <C extends GenericContextSP<C>>(hpCount: Get<C, number>) =>
    (c: C) => !calculate(hpCount, c).isFree;
const notByCash = <C extends GenericContextSP<C>>(c: C) => c.v.fakturace.hotove == 'no';
const areNewPrices = <C extends GenericContextSP<C>>(c: C) => new Date(c.v.zasah.datum) >= newPrices;

export const defaultGenericSP = <C extends GenericContextSP<C>>(
    getPdfData: GetT<C, Omit<InlinePdfPreviewData<C, 'NSP'>, 'type'>>, hpCount: Get<C, number>, titleLevel: HeadingLevel = 2, reduceOperations = false,
): FormPlus<GenericFormSP<C>> => ({
    system: {
        datumUvedeni: newInputWidget({ label: t => t.sp.commissioningDate, type: 'date', required: false }),
        zaruka: newRadioWidget({
            label: t => t.sp.warranty, options: [`warrantyCommon`, `warrantyExtended`], required: false, labels,
            onValueSet: (c, warranty) => {
                if (warranty == 'warrantyCommon') c.v.fakturace.invoiceParts = invoiceableParts;
                else c.v.fakturace.invoiceParts = [];
            },
        }),
    },
    zasah: {
        _title: newTitleWidget({ text: t => t.sp.intervention, level: titleLevel }),
        datum: defaultGenericSZ<C>().zasah.datum,
        clovek: defaultGenericSZ<C>(c => c.v.zasah.showNameFileds).zasah.clovek,
        showNameFileds: newHiddenValueWidget(false, true),
        inicialy: newInputWidget({
            label: t => t.sp.technicianInitials,
            show: c => c.v.zasah.showNameFileds,
            showInXML: false,
            lock: c => !!c.v.lockNameFields,
        }),
        nahlasenaZavada: newInputWidget({ label: t => t.sp.reportedFault, required: false }),
        _overflowFault: newTextWidget<C>({ text: (t, c) => inlineTooLong(c.v.zasah.nahlasenaZavada) ? t.sp.textTooLong : '' }),
        popis: defaultGenericSZ<C>().zasah.popis,
        _overflowIntervention: newTextWidget<C>({ text: (t, c) => multilineTooLong(c.v.zasah.popis) ? t.sp.textTooLong : '' }),
        interventionDuration: newInputWidget({
            label: t => t.sp.interventionTime,
            type: 'number',
            onError: t => t.wrong.number, suffix: t => t.units.h, required: false,
        }),
    },
    ukony: {
        _title: newTitleWidget({ text: t => t.sp.billing, level: titleLevel }),
        ukony: newMultiCheckboxWidget({
            label: (t, c) => reduceOperations ? t.sp.operations : t.sp.operationsMax(3 - (c.v.ukony.ukony.includes('yearlyHPCheck') && hpCount(c) > 1 ? 1 : 0) - (c.v.ukony.ukony.includes('commissioningTC') && hpCount(c) > 1 ? 1 : 0) + (c.v.ukony.typPrace || c.v.ukony.doba ? 0 : 1)),
            max: c => c.v.ukony.typPrace || c.v.ukony.doba ? 3 : 4,
            required: false,
            options: reduceOperations ? independentOperations : operations,
            labels,
            weights: (c, i) =>
                i == 'yearlyHPCheck' && hpCount(c) > 1
                || i == 'commissioningTC' && hpCount(c) > 1
                    ? 2 : 1,
        }),
        typPrace: newRadioWidget({
            label: t => t.sp.workType, required: false, labels, show: c => !areNewPrices(c),
            lock: c => c.v.ukony.ukony.sumBy(i => c.f.ukony.ukony.weights(c, i)) == 4,
            options: [`assemblyWork`, `technicalAssistance`, `assemblyWork12`],
        }),
        taxRate: newRadioWidget({
            label: t => t.sp.taxRate, show: areNewPrices, required: areNewPrices, options: [`12`, `21`],
            labels: _ => ({ 12: '12 %', 21: '21 %' }),
        }),
        doba: newInputWidget({
            label: (t, c) => areNewPrices(c) ? t.sp.billedServiceTechnicianWork : t.sp.billedTime,
            type: 'number', show: c => c.v.ukony.typPrace != null || areNewPrices(c),
            required: c => c.v.ukony.typPrace != null, onError: t => t.wrong.number, suffix: t => t.units.h,
            lock: c => c.v.ukony.ukony.sumBy(i => c.f.ukony.ukony.weights(c, i)) == 4,
        }),
        doprava: newInputWidget({
            label: t => t.sp.transportation, type: 'number',
            onError: t => t.wrong.number, suffix: t => t.units.km,
        }),
    },
    nahradniDily: {
        _title: newTitleWidget({ text: t => t.sp.usedSpareParts, level: titleLevel }),
        pocet: newCounterWidget({
            label: t => t.sp.sparePartCount, min: 0, max: c => c.v.fakturace.discount ? 7 : 8, chosen: 0,
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
        _title: newTitleWidget({ text: t => t.sp.invoicing, level: titleLevel }),
        invoiceParts: newMultiCheckboxWidget({
            label: t => t.sp.invoiceParts, options: c => [
                'transportation' as const,
                ...c.v.ukony.typPrace ? ['work' as const] : [],
                ...c.v.ukony.ukony,
            ], labels, required: false,
        }),
        discount: newInputWidget({
            label: t => t.sp.discountNoTax, inputmode: 'numeric', onError: t => t.wrong.number, suffix: t => t.units.czk, required: false,
            lock: c => c.v.nahradniDily.pocet == 8,
        }),
        discountReason: newInputWidget({
            label: t => t.sp.discountReason, required: false,
            show: c => Boolean(c.v.fakturace.discount),
        }),
        _price: newTextWidget<C>({ text: (t, c) => t.sp.price(calculate(hpCount, c)), class: 'fs-5' }),
        hotove: newChooserWidget({
            label: t => t.sp.paidInCash, options: ['yes', 'no'] as ('yes' | 'no' | 'doNotInvoice')[], labels, chosen: 'no',
            required: notFree(hpCount), show: notFree(hpCount),
        }),
        komu: newRadioWithInputWidget({
            label: t => t.sp.whoToInvoice, labels, otherLabel: t => t.sp.crnOrName,
            options: ['investor', `assemblyCompany`, `commissioningCompany`, 'otherCompany'],
            required: c => notByCash(c) && notFree(hpCount)(c), show: c => notByCash(c) && notFree(hpCount)(c),
        }),
        jak: newRadioWidget({
            label: t => t.sp.send, options: ['onPaper', 'electronically'], labels,
            required: c => notByCash(c) && notFree(hpCount)(c), show: c => notByCash(c) && notFree(hpCount)(c),
        }),
    },
    other: {
        _title: newTitleWidget({
            text: t => t.pdf.documentPreview, showInXML: false, level: 2,
        }),
        preview: newInlinePdfPreviewWidget({
            pdfData: (t, c) => ({
                type: 'NSP',
                ...getPdfData(t, c),
            }),
        }),
    },
});

export default (): FormSP => defaultGenericSP((t, c) => ({
    data: generalizeServiceProtocol(c.ir.meta, c.ir.IN, c.raw, t),
    form: c.f,
    values: c.v,
    pumpCount: cascadePumps(c.ir.IN).length,
}), c => cascadePumps(c.ir.IN).length);