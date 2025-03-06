import { ChooserWidget, CounterWidget, InputWidget, MultiCheckboxWidget, p, RadioWidget, SearchWidget, TextWidget, TitleWidget } from '../Widget.svelte.js';
import { type SparePart, sparePartsList, startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { page } from '$app/state';
import { upravitServisniProtokol, vyplnitServisniProtokol } from '$lib/client/firestore';
import { currentUser } from '$lib/client/auth';
import { type FormInfo } from './forms.svelte.js';
import type { User } from 'firebase/auth';
import { nowISO } from '$lib/helpers/date';
import type { TranslationReference } from '$lib/translations';

export type UDSP = {
    protokol: DataSP,
    evidence: Raw<Data>,
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
    name: p`Jíné`,
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
                console.log(i)
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
        popis: new InputWidget({ label: p`Popis zásahu`, required: false })
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
            (['nahradniDil1', 'nahradniDil2', 'nahradniDil3'] as const).forEach(dil => {
                if (raw[dil].dil?.name == otherPart.name) raw[dil].dil = {
                    name: data[dil].name.value,
                    code: Number(data[dil].code.value).roundTo(2),
                    unitPrice: Number(data[dil].unitPrice.value).roundTo(2),
                };
            });
            return edit
                ? upravitServisniProtokol(irid, i, raw)
                : vyplnitServisniProtokol(irid, raw);
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
                p.nahradniDil1.dil.items = () => spareParts;
                p.nahradniDil2.dil.items = () => spareParts;
                p.nahradniDil3.dil.items = () => spareParts;
            }, [sparePartsList]],
        ],
    };
    return info;
})();