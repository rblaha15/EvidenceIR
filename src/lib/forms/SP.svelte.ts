import { ChooserWidget, CounterWidget, InputWidget, MultiCheckboxWidget, p, RadioWidget, SearchWidget, TextWidget, TitleWidget } from '../Widget.svelte.js';
import { type SparePart, sparePartsList, startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import { dataToRawData, type Form, type Raw } from '$lib/forms/Form';
import { page } from '$app/state';
import { extractSPIDFromRawData, upravitServisniProtokol, vyplnitServisniProtokol } from '$lib/client/firestore';
import { currentUser } from '$lib/client/auth';
import type { User } from 'firebase/auth';
import { nowISO } from '$lib/helpers/date';
import { makePlain, type TranslationReference } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/Import';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { spName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';

type NahradniDil<D extends Form<D>> = {
    label: TextWidget<D>,
    dil: SearchWidget<D, SparePart>,
    name: InputWidget<D, true>;
    code: InputWidget<D, true>;
    unitPrice: InputWidget<D, true>;
    mnozstvi: InputWidget<D>,
}

export type DataSP = GenericDataSP<DataSP>

export interface GenericDataSP<D extends GenericDataSP<D>> extends Form<D> {
    zasah: {
        datum: InputWidget<D>,
        clovek: InputWidget<D>,
        inicialy: InputWidget<D>,
        doba: InputWidget<D>,
        druh: MultiCheckboxWidget<D>,
        nahlasenaZavada: InputWidget<D>,
        popis: InputWidget<D>,
    },
    ukony: {
        nadpis: TitleWidget<D>,
        doprava: InputWidget<D>,
        typPrace: RadioWidget<D>,
        mnozstviPrace: InputWidget<D>,
        ukony: MultiCheckboxWidget<D>,
    },
    nahradniDily: {
        nadpis: TitleWidget<D>,
        pocet: CounterWidget<D>,
    },
    nahradniDil1: NahradniDil<D>,
    nahradniDil2: NahradniDil<D>,
    nahradniDil3: NahradniDil<D>,
    fakturace: {
        nadpis: TitleWidget<D>,
        hotove: ChooserWidget<D>,
        komu: RadioWidget<D>,
        jak: RadioWidget<D>,
    },
}

export const otherPart = <SparePart> {
    name: p`Jiné`,
};

const nahradniDil = <D extends Form<D>>(n: 1 | 2 | 3): NahradniDil<D> => {
    const show = (d: D) => d.nahradniDily.pocet.value >= n;
    const dil = (d: D) => d[`nahradniDil${n}` as const];
    const showDetails = (d: D) => show(d) && dil(d).dil.value?.name == otherPart.name;

    return ({
        label: new TextWidget({
            show: show, text: p`Náhradní díl ${n.toString()}:`,
        }),
        dil: new SearchWidget({
            show: show, required: show,
            label: p`Položka`, items: [], getSearchItem: (i: SparePart) => {
                return i.name == otherPart.name
                    ? ({ pieces: [{ text: i.name as TranslationReference }] as const })
                    : ({
                        pieces: [
                            { text: p`${i.code.toString()}`, width: .08 },
                            { text: p`${i.name}`, width: .8 },
                            { text: p`${i.unitPrice.roundTo(2).toLocaleString('cs')} Kč`, width: .12 },
                        ] as const,
                    });
            }
        }),
        name: new InputWidget({
            label: p`Název`, hideInRawData: true, required: showDetails, show: showDetails,
        }),
        code: new InputWidget({
            label: p`Kód`, type: 'number', hideInRawData: true, required: showDetails, show: showDetails,
        }),
        unitPrice: new InputWidget({
            label: p`Jednotková cena`, type: 'number', hideInRawData: true, required: showDetails, show: showDetails
        }),
        mnozstvi: new InputWidget({
            label: p`Množství`, type: `number`, onError: `wrongNumberFormat`, text: '1',
            show: show, required: show,
        }),
    });
};

export const defaultDataSP = <D extends GenericDataSP<D>>(): GenericDataSP<D> => ({
    zasah: {
        datum: new InputWidget({ label: p`Datum a čas zásahu`, type: 'datetime-local' }),
        clovek: new InputWidget({ label: p`Jméno technika`, show: false, required: false }),
        inicialy: new InputWidget({ label: p`Iniciály technika (do ID SP)`, show: false, required: false }),
        doba: new InputWidget({ label: p`Celková doba zásahu (hodin)`, type: 'number', onError: `wrongNumberFormat` }),
        druh: new MultiCheckboxWidget({
            label: p`Druh zásahu`,
            options: [`commissioning`, `sp.yearlyCheck`, `sp.warrantyRepair`, `sp.postWarrantyRepair`, `sp.installationApproval`, `sp.otherType`]
        }),
        nahlasenaZavada: new InputWidget({ label: p`Nahlášená závada`, required: false }),
        popis: new InputWidget({ label: p`Popis zásahu`, required: false, textArea: true })
    },
    ukony: {
        nadpis: new TitleWidget({ text: p`Vyúčtování` }),
        doprava: new InputWidget({ label: p`Doprava (km)`, type: 'number', onError: `wrongNumberFormat` }),
        typPrace: new RadioWidget({ label: p`Typ práce`, options: [`sp.technicalAssistance`, `sp.assemblyWork`], required: false }),
        mnozstviPrace: new InputWidget({
            label: p`Počet hodin práce`, type: 'number', onError: `wrongNumberFormat`,
            show: d => d.ukony.typPrace.value != null, required: d => d.ukony.typPrace.value != null
        }),
        ukony: new MultiCheckboxWidget({
            label: p`Pracovní úkony (max. 3)`, max: 3, required: false, options: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`,
            ]
        }),
    },
    nahradniDily: {
        nadpis: new TitleWidget({ text: p`Použité náhradní díly` }),
        pocet: new CounterWidget({ label: p`Počet náhradních dílů`, min: 0, max: 3, chosen: 0 }),
    },
    nahradniDil1: nahradniDil(1),
    nahradniDil2: nahradniDil(2),
    nahradniDil3: nahradniDil(3),
    fakturace: {
        nadpis: new TitleWidget({ text: p`Fakturace` }),
        hotove: new ChooserWidget({ label: p`Placeno hotově`, options: ['yes', 'no', 'doNotInvoice'] }),
        komu: new RadioWidget({
            label: p`Komu fakturovat`, options: [p`Investor`, `assemblyCompany`],
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: p`Fakturovat`, options: [p`Papírově`, p`Elektronicky`],
            required: d => d.fakturace.hotove.value == 'no', show: d => d.fakturace.hotove.value == 'no',
        }),
    },
});

const importSparePart = (i: 0 | 1 | 2): ExcelImport<Raw<DataSP>>['cells']['nahradniDil1'] => ({
    dil: {
        getData: get => ({
            name: get([1, 43 + i]),
            code: Number(get([6, 43 + i])),
            unitPrice: Number(get([12, 43 + i])),
        })
    },
    mnozstvi: { address: [9, 43 + i] },
});

const cells: ExcelImport<Raw<DataSP>>['cells'] = {
    zasah: {
        datum: { address: [14, 1], transform: v => v.split('-')[0].split('/').map(n => n.padStart(2, '0')).join('-') + 'T' + v.split('-')[1] + ':00' },
        clovek: { address: [11, 21] },
        doba: { address: [16, 21] },
        druh: {
            getData: get => ([
                ['commissioning', get([6, 23])],
                [`sp.yearlyCheck`, get([6, 25])],
                [`sp.warrantyRepair`, get([13, 23])],
                [`sp.postWarrantyRepair`, get([13, 25])],
                [`sp.installationApproval`, get([20, 23])],
                [`sp.otherType`, get([20, 25])],
            ] as const).filter(([, i]) => i as unknown as boolean).map(([n]) => n)
        },
        inicialy: { address: [13, 1] },
        popis: { address: [1, 30] },
        nahlasenaZavada: { address: [5, 28] },
    },
    ukony: {
        doprava: { address: [9, 38] },
        mnozstviPrace: { address: [9, 39] },
        typPrace: { address: [1, 39], transform: v => v.includes('pomoc') ? `sp.technicalAssistance` : 'sp.assemblyWork' },
        ukony: {
            getData: get => [get([1, 40]), get([1, 41]), get([1, 42])]
                .filter(it => it != 'Vyberte úkon')
                .map(u => ([
                    ['Route', `sp.regulusRoute`] as const,
                    ['Uvedení TČ', `sp.commissioningTC`] as const,
                    ['Uvedení SOL', `sp.commissioningSOL`] as const,
                    ['kontrola TČ', `yearlyHPCheck`] as const,
                    ['kontrola SOL', `sp.yearlySOLCheck`] as const,
                    ['Záruka', `sp.extendedWarranty`] as const,
                    ['instalace', `sp.installationApproval`] as const,
                ] as const).find(([s]) => u.includes(s))![1])
        },
    },
    nahradniDil1: importSparePart(0),
    nahradniDil2: importSparePart(1),
    nahradniDil3: importSparePart(2),
    nahradniDily: {
        pocet: { constant: 1 },
    },
    fakturace: {
        hotove: { address: [18, 43], transform: v => v == 'ANO' ? 'yes' : v == 'NE' ? 'no' : 'doNotInvoice' },
        komu: { address: [18, 45], transform: v => v == 'Odběratel' ? p`Investor` : 'assemblyCompany' },
        jak: { address: [18, 46], transform: v => makePlain(v[0].toUpperCase() + v.slice(1))! },
    },
};

export const updateOtherSpareParts = <D extends GenericDataSP<D>>(d: D, spareParts: SparePart[] = d.nahradniDil1.dil.items(d)) => {
    [d.nahradniDil1, d.nahradniDil2, d.nahradniDil3].forEach(nahradniDil => {
        if (nahradniDil.dil.value && !spareParts.some(p => p.code == nahradniDil.dil.value?.code)) {
            nahradniDil.name.setValue(d, nahradniDil.dil.value.name);
            nahradniDil.code.setValue(d, nahradniDil.dil.value.code.toString());
            nahradniDil.unitPrice.setValue(d, nahradniDil.dil.value.unitPrice?.toString());
            nahradniDil.dil.setValue(d, otherPart);
        }
    });
};

export const compactOtherSpareData = <D extends GenericDataSP<D>>(data: GenericDataSP<D>, raw: Raw<GenericDataSP<D>>) => {
    (['nahradniDil1', 'nahradniDil2', 'nahradniDil3'] as const).forEach(dil => {
        const nahradniDil = raw[dil] as Raw<NahradniDil<D>>;
        if (nahradniDil.dil?.name == otherPart.name) nahradniDil.dil = {
            name: data[dil].name.value,
            code: Number(data[dil].code.value).roundTo(2),
            unitPrice: Number(data[dil].unitPrice.value).roundTo(2),
        };
    });
};

export const sp = (() => {
    let i = $state() as number;
    const info: import('./forms.svelte').FormInfo<DataSP, DataSP, [[Technician[], User | null], [SparePart[]]]> = {
        storeName: 'stored_sp',
        defaultData: () => defaultDataSP(),
        pdfLink: () => `installationProtocol-${i}`,
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
        saveData: async (irid, raw, edit, data, editResult, t, send) => {
            compactOtherSpareData(data, raw);
            if (edit) await upravitServisniProtokol(irid, i, raw);
            else await vyplnitServisniProtokol(irid, raw);

            if (edit && !send) return true

            const response = await sendEmail({
                ...defaultAddresses(),
                subject: edit
                    ? `Upravený servisní protokol: ${spName(raw.zasah)}`
                    : `Nový servisní protokol: ${spName(raw.zasah)}`,
                component: MailProtocol,
                props: { name: raw.zasah.clovek, origin: page.url.origin, irid_spid: irid },
            });

            if (response!.ok) return true;
            else editResult({
                text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
                red: true,
                load: false
            });
        },
        storeData: data => {
            const raw = dataToRawData(data);
            compactOtherSpareData(data, raw);
            return raw;
        },
        createWidgetData: (_, protokol) => protokol,
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
            [(_, p, [$techniciansList, $currentUser]) => {
                const ja = $techniciansList.find(t => $currentUser?.email == t.email);
                p.zasah.clovek.setValue(p, ja?.name ?? p.zasah.clovek.value);
                p.zasah.clovek.show = () => !ja;
                p.zasah.clovek.required = () => !ja;
                p.zasah.inicialy.setValue(p, ja?.initials ?? p.zasah.inicialy.value);
                p.zasah.inicialy.show = () => !ja;
                p.zasah.inicialy.required = () => !ja;
            }, [techniciansList, currentUser]],
            [(_, p, [$sparePartsList]) => {
                const spareParts = [otherPart, ...$sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) as SparePart)];
                [p.nahradniDil1, p.nahradniDil2, p.nahradniDil3].forEach(nahradniDil => {
                    nahradniDil.dil.items = () => spareParts;
                });
                updateOtherSpareParts(p, spareParts);
            }, [sparePartsList]],
        ],
        importOptions: {
            sheet: 'Protokol',
            onImport: d => updateOtherSpareParts(d),
            cells,
        },
    };
    return info;
})();