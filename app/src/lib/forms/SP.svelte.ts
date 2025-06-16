import {
    ChooserWidget,
    CounterWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '../Widget.svelte.js';
import {
    getIsOnline,
    type SparePart,
    sparePartsList,
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import { type Form, type Raw } from '$lib/forms/Form';
import { page } from '$app/state';
import { currentUser } from '$lib/client/auth';
import type { User } from 'firebase/auth';
import { nowISO } from '$lib/helpers/date';
import { makePlain, type P, p, plainArray } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/Import';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { spName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { range } from '$lib/extensions';
import db from '$lib/client/data';

type NahradniDil<D extends Form<D>> = {
    label: TextWidget<D>,
    dil: SearchWidget<D, SparePart, true>,
    name: InputWidget<D>;
    code: InputWidget<D>;
    unitPrice: InputWidget<D>;
    warehouse: InputWidget<D>,
    mnozstvi: InputWidget<D>,
}

export type DataSP = GenericDataSP<DataSP>

export interface GenericDataSP<D extends GenericDataSP<D>> extends Form<D> {
    zasah: {
        datum: InputWidget<D>,
        clovek: InputWidget<D>,
        inicialy: InputWidget<D>,
        zaruka: RadioWidget<D, `sp.warrantyCommon` | `sp.warrantyExtended`>,
        nahlasenaZavada: InputWidget<D>,
        popis: InputWidget<D>,
    },
    ukony: {
        nadpis: TitleWidget<D>,
        doprava: InputWidget<D>,
        typPrace: RadioWidget<D, `sp.assemblyWork` | `sp.technicalAssistance` | `sp.technicalAssistance12`>,
        ukony: MultiCheckboxWidget<D, `sp.regulusRoute` | `sp.commissioningTC` | `sp.commissioningSOL` | `sp.yearlyHPCheck` | `sp.yearlySOLCheck` | `sp.extendedWarranty` | `sp.installationApproval` | 'sp.withoutCode'>,
        doba: InputWidget<D>,
    },
    nahradniDily: {
        nadpis: TitleWidget<D>,
        pocet: CounterWidget<D>,
    },
    nahradniDil1: NahradniDil<D>,
    nahradniDil2: NahradniDil<D>,
    nahradniDil3: NahradniDil<D>,
    nahradniDil4: NahradniDil<D>,
    nahradniDil5: NahradniDil<D>,
    nahradniDil6: NahradniDil<D>,
    nahradniDil7: NahradniDil<D>,
    nahradniDil8: NahradniDil<D>,
    fakturace: {
        nadpis: TitleWidget<D>,
        hotove: ChooserWidget<D, 'yes' | 'no' | 'doNotInvoice'>,
        komu: RadioWidget<D, P<'Investor'> | `assemblyCompany`>,
        jak: RadioWidget<D, P<'Papírově' | 'Elektronicky'>>,
    },
}

const nahradniDil = <D extends GenericDataSP<D>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): NahradniDil<D> => {
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

export const defaultDataSP = <D extends GenericDataSP<D>>(): GenericDataSP<D> => ({
    zasah: {
        datum: new InputWidget({ label: p('Datum a čas zásahu'), type: 'datetime-local' }),
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
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `sp.yearlyHPCheck`,
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
    nahradniDil1: nahradniDil(1),
    nahradniDil2: nahradniDil(2),
    nahradniDil3: nahradniDil(3),
    nahradniDil4: nahradniDil(4),
    nahradniDil5: nahradniDil(5),
    nahradniDil6: nahradniDil(6),
    nahradniDil7: nahradniDil(7),
    nahradniDil8: nahradniDil(8),
    fakturace: {
        nadpis: new TitleWidget({ text: p('Fakturace') }),
        hotove: new ChooserWidget({ label: p('Placeno hotově'), options: ['yes', 'no', 'doNotInvoice'] }),
        komu: new RadioWidget({
            label: p('Komu fakturovat'), options: [p('Investor'), `assemblyCompany`],
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: p('Fakturovat'), options: plainArray(['Papírově', 'Elektronicky']),
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
    },
});

const importSparePart = (i: 0 | 1 | 2) => ({
    name: { address: [1, 43 + i] },
    code: { address: [6, 43 + i] },
    unitPrice: { address: [12, 43 + i] },
    mnozstvi: { address: [9, 43 + i] },
}) satisfies ExcelImport<Raw<DataSP>>['cells']['nahradniDil1'];

const cells: ExcelImport<Raw<DataSP>>['cells'] = {
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
    nahradniDil1: importSparePart(0),
    nahradniDil2: importSparePart(1),
    nahradniDil3: importSparePart(2),
    nahradniDily: {
        pocet: {
            getData: get => range(3).filter(i => get(importSparePart(i as 0 | 1 | 2).name.address)).length
        },
    },
    fakturace: {
        hotove: { address: [18, 43], transform: v => v == 'ANO' ? 'yes' : v == 'NE' ? 'no' : 'doNotInvoice' },
        komu: { address: [18, 45], transform: v => v == 'Odběratel' ? p('Investor') : 'assemblyCompany' },
        jak: { address: [18, 46], transform: v => makePlain(v[0].toUpperCase() + v.slice(1) as 'Papírově' | 'Elektronicky')! },
    },
};

export const sp = (() => {
    let i = $state() as number;
    const info: import('./forms.svelte').FormInfo<DataSP, DataSP, [[Technician[], User | null], [SparePart[]]], 'SP'> = {
        storeName: 'stored_sp',
        defaultData: () => defaultDataSP(),
        openPdf: () => ({
            link: 'SP',
            index: i,
        }),
        getEditData: ir => {
            const editIndex = page.url.searchParams.get('edit') as string | null;
            if (editIndex) {
                i = Number(editIndex);
                return ir.installationProtocols[i];
            } else {
                i = ir.installationProtocols.length;
                return undefined;
            }
        },
        saveData: async (irid, raw, edit, _, editResult, t, send) => {
            const name = spName(raw.zasah);

            const ir = (await db.getIR(irid))!;

            if (!edit && getIsOnline() && ir.installationProtocols.some(p => spName(p.zasah) == name)) {
                editResult({ text: 'SP již existuje.', red: true, load: false });
                return false;
            }

            if (edit) await db.editServiceProtocol(irid, i, raw);
            else await db.addServiceProtocol(irid, raw);

            if (edit && !send) return true;

            const response = await sendEmail({
                ...defaultAddresses(),
                subject: edit
                    ? `Upravený servisní protokol: ${name}`
                    : `Nový servisní protokol: ${name}`,
                component: MailProtocol,
                props: { name: raw.zasah.clovek, origin: page.url.origin, id: irid },
            });

            if (response!.ok) return true;
            else editResult({
                text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
                red: true,
                load: false,
            });
        },
        createWidgetData: (_, p) => p,
        title: (_, edit) => edit
            ? `Editace SP`
            : `Instalační a servisní protokol`,
        onMount: async (d, p) => {
            await startTechniciansListening();
            await startSparePartsListening();
            if (!p.zasah.datum.value)
                p.zasah.datum.setValue(d, nowISO());
        },
        storeEffects: [
            [(_, p, [$techniciansList, $currentUser], edit) => {
                const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
                if (!p.zasah.clovek.value) p.zasah.clovek.setValue(p, ja?.name ?? p.zasah.clovek.value);
                p.zasah.clovek.show = () => p.zasah.clovek.value != ja?.name;
                if (!p.zasah.inicialy.value) p.zasah.inicialy.setValue(p, ja?.initials ?? p.zasah.inicialy.value);
                p.zasah.inicialy.show = () => p.zasah.inicialy.value != ja?.initials;
            }, [techniciansList, currentUser]],
            [(_, p, [$sparePartsList]) => {
                const spareParts = $sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) satisfies SparePart);
                [
                    p.nahradniDil1, p.nahradniDil2, p.nahradniDil3, p.nahradniDil4,
                    p.nahradniDil5, p.nahradniDil6, p.nahradniDil7, p.nahradniDil8,
                ].forEach(nahradniDil => {
                    nahradniDil.dil.items = () => spareParts;
                });
            }, [sparePartsList]],
        ],
        importOptions: {
            sheet: 'Protokol',
            onImport: (_, p) => {
                p.zasah.clovek.show = () => true;
                p.zasah.inicialy.show = () => true;
            },
            cells,
            sheetFilter: n => n.includes('Protokol'),
        },
    };
    return info;
})();