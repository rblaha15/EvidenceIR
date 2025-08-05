import {
    ChooserWidget,
    CounterWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import { p } from '$lib/translations';
import type { SparePart } from '$lib/client/realtime';
import type { GenericFormSP, SparePartWidgetGroup } from '$lib/forms/SP/formSP.svelte';

const sparePart = <D extends GenericFormSP<D>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): SparePartWidgetGroup<D> => {
    const show = (d: D) => d.nahradniDily.pocet.value >= n;
    const dil = (d: D) => d[`nahradniDil${n}` as const];

    return ({
        label: new TextWidget({
            show, text: (_, t) => t.refFromTemplate('sp.sparePart', { n: `${n}` }), class: 'fs-5',
        }),
        dil: new SearchWidget({
            required: false, show, hideInRawData: true, label: 'sp.searchItem', items: [],
            onValueSet: (d, part) => {
                const nd = dil(d);
                nd.code.setValue(d, part?.code?.let(String) ?? '');
                nd.name.setValue(d, part?.name ?? '');
                nd.unitPrice.setValue(d, part?.unitPrice?.let(String) ?? '');
                nd.dil._value = null;
            }, getSearchItem: (i: SparePart) => ({
                pieces: [
                    { text: p(i.code.toString()), width: .08 },
                    { text: p(i.name), width: .8 },
                    { text: p(i.unitPrice.roundTo(2).toLocaleString('cs') + ' Kč'), width: .12 },
                ] as const,
            }), showInXML: false,
        }),
        name: new InputWidget({
            label: 'sp.name', required: show, show,
        }),
        code: new InputWidget({
            label: 'sp.code', type: 'number', required: false, show,
        }),
        unitPrice: new InputWidget({
            label: 'sp.unitPrice', type: 'number', required: show, show, suffix: p('Kč'),
        }),
        warehouse: new InputWidget({
            label: 'sp.warehouse', required: false, show,
        }),
        mnozstvi: new InputWidget({
            label: 'sp.amount', type: `number`, onError: `wrong.number`, text: '1',
            required: show, show,
        }),
    });
};

export default <D extends GenericFormSP<D>>(): GenericFormSP<D> => ({
    zasah: {
        datum: new InputWidget({ label: 'sp.interventionDate', type: 'datetime-local' }),
        datumUvedeni: new InputWidget({ label: 'sp.commissioningDate', type: 'date', required: false }),
        clovek: new InputWidget({ label: 'sp.technicianName', show: false }),
        inicialy: new InputWidget({ label: 'sp.technicianInitials', show: false, showInXML: false }),
        zaruka: new RadioWidget({ label: 'sp.warranty', options: [`sp.warrantyCommon`, `sp.warrantyExtended`], required: false }),
        nahlasenaZavada: new InputWidget({ label: 'sp.reportedFault', required: false }),
        popis: new InputWidget({ label: 'sp.interventionDescription', required: false, textArea: true }),
    },
    ukony: {
        nadpis: new TitleWidget({ text: 'sp.billing' }),
        doprava: new InputWidget({ label: 'sp.transportation', type: 'number', onError: `wrong.number`, suffix: 'units.km' }),
        typPrace: new RadioWidget({
            label: 'sp.workType',
            options: [`sp.assemblyWork`, `sp.technicalAssistance`, `sp.technicalAssistance12`],
            required: false,
        }),
        ukony: new MultiCheckboxWidget({
            label: 'sp.operations', max: 3, required: false, options: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `sp.commissioningFVE`, `sp.yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`, `sp.withoutCode`,
            ],
        }),
        doba: new InputWidget({
            label: d => d.ukony.typPrace.value != null ? 'sp.billedTime' : 'sp.interventionTime',
            type: 'number',
            onError: `wrong.number`,
            suffix: 'units.h',
        }),
    },
    nahradniDily: {
        nadpis: new TitleWidget({ text: 'sp.usedSpareParts' }),
        pocet: new CounterWidget({ label: 'sp.sparePartCount', min: 0, max: 8, chosen: 0 }),
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
        nadpis: new TitleWidget({ text: 'sp.invoicing' }),
        hotove: new ChooserWidget({ label: 'sp.paidInCash', options: ['yes', 'no', 'doNotInvoice'] }),
        komu: new RadioWidget({
            label: 'sp.whoToInvoice', options: [p('Investor'), `assemblyCompany`],
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: 'sp.invoice', options: p(['Papírově', 'Elektronicky']),
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
    },
});