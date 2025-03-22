import { ChooserWidget, CounterWidget, InputWidget, MultiCheckboxWidget, p, RadioWidget, SearchWidget, TextWidget, TitleWidget } from '../Widget.svelte.js';
import { type SparePart, sparePartsList, startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import { dataToRawData, type Raw } from '$lib/forms/Form';
import { page } from '$app/state';
import { upravitServisniProtokol, vyplnitServisniProtokol } from '$lib/client/firestore';
import { currentUser } from '$lib/client/auth';
import { type FormInfo } from './forms.svelte.js';
import type { User } from 'firebase/auth';
import { nowISO } from '$lib/helpers/date';
import { makePlain, type TranslationReference } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/Import';

export type UDSP = {
    protokol: DataSP,
}

type NahradniDil = {
    label: TextWidget<UDSP>,
    dil: SearchWidget<UDSP, SparePart>,
    name: InputWidget<UDSP, true>;
    code: InputWidget<UDSP, true>;
    unitPrice: InputWidget<UDSP, true>;
    mnozstvi: InputWidget<UDSP>,
}

export type DataSP = {
    zasah: {
        datum: InputWidget<UDSP>,
        clovek: InputWidget<UDSP>,
        inicialy: InputWidget<UDSP>,
        doba: InputWidget<UDSP>,
        druh: MultiCheckboxWidget<UDSP>,
        nahlasenaZavada: InputWidget<UDSP>,
        popis: InputWidget<UDSP>,
    },
    ukony: {
        nadpis: TitleWidget<UDSP>,
        doprava: InputWidget<UDSP>,
        typPrace: RadioWidget<UDSP>,
        mnozstviPrace: InputWidget<UDSP>,
        ukony: MultiCheckboxWidget<UDSP>,
    },
    nahradniDily: {
        nadpis: TitleWidget<UDSP>,
        pocet: CounterWidget<UDSP>,
    },
    nahradniDil1: NahradniDil,
    nahradniDil2: NahradniDil,
    nahradniDil3: NahradniDil,
    fakturace: {
        nadpis: TitleWidget<UDSP>,
        hotove: ChooserWidget<UDSP>,
        komu: RadioWidget<UDSP>,
        jak: RadioWidget<UDSP>,
    },
}

export const otherPart = <SparePart> {
    name: p`Jiné`,
};

const nahradniDil = (n: 1 | 2 | 3): NahradniDil => {
    const show = (d: UDSP) => d.protokol.nahradniDily.pocet.value >= n;
    const dil = (d: UDSP) => d.protokol[`nahradniDil${n}` as const];
    const showDetails = (d: UDSP) => show(d) && dil(d).dil.value?.name == otherPart.name;

    return ({
        label: new TextWidget({
            show: show, label: p`Náhradní díl ${n.toString()}:`,
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

export const defaultDataSP = (): DataSP => ({
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
        nadpis: new TitleWidget({ label: p`Vyúčtování` }),
        doprava: new InputWidget({ label: p`Doprava (km)`, type: 'number', onError: `wrongNumberFormat` }),
        typPrace: new RadioWidget({ label: p`Typ práce`, options: [`sp.technicalAssistance`, `sp.assemblyWork`], required: false }),
        mnozstviPrace: new InputWidget({
            label: p`Počet hodin práce`, type: 'number', onError: `wrongNumberFormat`,
            show: d => d.protokol.ukony.typPrace.value != null, required: d => d.protokol.ukony.typPrace.value != null
        }),
        ukony: new MultiCheckboxWidget({
            label: p`Pracovní úkony (max. 3)`, max: 3, required: false, options: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`,
            ]
        }),
    },
    nahradniDily: {
        nadpis: new TitleWidget({ label: p`Použité náhradní díly` }),
        pocet: new CounterWidget({ label: p`Počet náhradních dílů`, min: 0, max: 3, chosen: 0 }),
    },
    nahradniDil1: nahradniDil(1),
    nahradniDil2: nahradniDil(2),
    nahradniDil3: nahradniDil(3),
    fakturace: {
        nadpis: new TitleWidget({ label: p`Fakturace` }),
        hotove: new ChooserWidget({ label: p`Placeno hotově`, options: ['yes', 'no', 'doNotInvoice'] }),
        komu: new RadioWidget({
            label: p`Komu fakturovat`, options: [p`Investor`, `assemblyCompany`],
            required: d => d.protokol.fakturace.hotove.value == 'no', show: d => d.protokol.fakturace.hotove.value == 'no',
        }),
        jak: new RadioWidget({
            label: p`Fakturovat`, options: [p`Papírově`, p`Elektronicky`],
            required: d => d.protokol.fakturace.hotove.value == 'no', show: d => d.protokol.fakturace.hotove.value == 'no',
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

export const updateOtherSpareParts = (p: DataSP, spareParts: SparePart[] = p.nahradniDil1.dil.items({} as UDSP)) => {
    [p.nahradniDil1, p.nahradniDil2, p.nahradniDil3].forEach(nahradniDil => {
        if (nahradniDil.dil.value && !spareParts.some(p => p.code == nahradniDil.dil.value?.code)) {
            nahradniDil.name.value = nahradniDil.dil.value.name;
            nahradniDil.code.value = nahradniDil.dil.value.code.toString();
            nahradniDil.unitPrice.value = nahradniDil.dil.value.unitPrice?.toString();
            nahradniDil.dil.value = otherPart;
        }
    });
};

export const compactOtherSpareData = (raw: Raw<DataSP>, data: DataSP) => {
    (['nahradniDil1', 'nahradniDil2', 'nahradniDil3'] as const).forEach(dil => {
        if (raw[dil].dil?.name == otherPart.name) raw[dil].dil = {
            name: data[dil].name.value,
            code: Number(data[dil].code.value).roundTo(2),
            unitPrice: Number(data[dil].unitPrice.value).roundTo(2),
        };
    });
};

export const sp = (() => {
    let i = $state() as number;
    const info: FormInfo<UDSP, DataSP, [[Technician[], User | null], [SparePart[]]]> = {
        storeName: 'stored_sp',
        defaultData: defaultDataSP,
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
        saveData: (irid, raw, edit, data) => {
            compactOtherSpareData(raw, data);
            return edit
                ? upravitServisniProtokol(irid, i, raw)
                : vyplnitServisniProtokol(irid, raw);
        },
        storeData: data => {
            const raw = dataToRawData(data);
            compactOtherSpareData(raw, data);
            return raw;
        },
        createWidgetData: (evidence, protokol) => ({ evidence, protokol }),
        title: edit => edit
            ? p`Editace SP`
            : p`Instalační a servisní protokol`,
        onMount: async p => {
            await startTechniciansListening();
            await startSparePartsListening();
            if (!p.zasah.datum.value)
                p.zasah.datum.value = nowISO();
        },
        storeEffects: [
            [(p, [$techniciansList, $currentUser]) => {
                const ja = $techniciansList.find(t => $currentUser?.email == t.email);
                p.zasah.clovek.value = ja?.name ?? p.zasah.clovek.value;
                p.zasah.clovek.show = () => !ja;
                p.zasah.clovek.required = () => !ja;
                p.zasah.inicialy.value = ja?.initials ?? p.zasah.inicialy.value;
                p.zasah.inicialy.show = () => !ja;
                p.zasah.inicialy.required = () => !ja;
            }, [techniciansList, currentUser]],
            [(p, [$sparePartsList]) => {
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
            onImport: updateOtherSpareParts,
            cells,
        },
    };
    return info;
})();