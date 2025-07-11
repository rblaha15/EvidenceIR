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
            show, text: p(`Náhradní díl ${n}`), class: 'fs-5',
        }),
        dil: new SearchWidget({
            required: false, show, hideInRawData: true, label: p('Vyhledat položku'), items: [],
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
            }),
        }),
        name: new InputWidget({
            label: p('Název'), required: show, show,
        }),
        code: new InputWidget({
            label: p('Kód'), type: 'number', required: false, show,
        }),
        unitPrice: new InputWidget({
            label: p('Jednotková cena'), type: 'number', required: show, show, suffix: p('Kč'),
        }),
        warehouse: new InputWidget({
            label: p('Sklad'), required: false, show,
        }),
        mnozstvi: new InputWidget({
            label: p('Množství'), type: `number`, onError: `wrongNumberFormat`, text: '1',
            required: show, show,
        }),
    });
};

export default <D extends GenericFormSP<D>>(): GenericFormSP<D> => ({
    zasah: {
        datum: new InputWidget({ label: p('Datum a čas zásahu'), type: 'datetime-local' }),
        datumUvedeni: new InputWidget({ label: p('Datum uvedení do provozu'), type: 'date', required: false }),
        clovek: new InputWidget({ label: p('Jméno technika'), show: false }),
        inicialy: new InputWidget({ label: p('Iniciály technika (do ID SP)'), show: false }),
        zaruka: new RadioWidget({ label: p('Záruka'), options: [`sp.warrantyCommon`, `sp.warrantyExtended`], required: false }),
        nahlasenaZavada: new InputWidget({ label: p('Nahlášená závada'), required: false }),
        popis: new InputWidget({ label: p('Popis zásahu'), required: false, textArea: true }),
    },
    ukony: {
        nadpis: new TitleWidget({ text: p('Vyúčtování') }),
        doprava: new InputWidget({ label: p('Doprava'), type: 'number', onError: `wrongNumberFormat`, suffix: 'units.km' }),
        typPrace: new RadioWidget({
            label: p('Typ práce'),
            options: [`sp.assemblyWork`, `sp.technicalAssistance`, `sp.technicalAssistance12`],
            required: false,
        }),
        ukony: new MultiCheckboxWidget({
            label: p('Pracovní úkony (max. 3)'), max: 3, required: false, options: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `sp.commissioningFVE`, `sp.yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`, `sp.withoutCode`,
            ],
        }),
        doba: new InputWidget({
            label: d => p(d.ukony.typPrace.value != null ? 'Doba fakturované práce' : 'Doba zásahu'),
            type: 'number',
            onError: `wrongNumberFormat`,
            suffix: 'units.h',
        }),
    },
    nahradniDily: {
        nadpis: new TitleWidget({ text: p('Použité náhradní díly') }),
        pocet: new CounterWidget({ label: p('Počet náhradních dílů'), min: 0, max: 8, chosen: 0 }),
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
        nadpis: new TitleWidget({ text: p('Fakturace') }),
        hotove: new ChooserWidget({ label: p('Placeno hotově'), options: ['yes', 'no', 'doNotInvoice'] }),
        komu: new RadioWidget({
            label: p('Komu fakturovat'), options: [p('Investor'), `assemblyCompany`],
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: p('Fakturovat'), options: p(['Papírově', 'Elektronicky']),
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
    },
});