import { MultiZaskrtavatkova, Nadpisova, p, Pisatkova, Pocitatkova, Radiova, SearchWidget, Vybiratkova } from '../Vec.svelte.js';
import { type SparePart, sparePartsList, startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { page } from '$app/state';
import { upravitServisniProtokol, vyplnitServisniProtokol } from '$lib/client/firestore';
import { currentUser } from '$lib/client/auth';
import { type FormInfo } from './forms.svelte.js';
import type { User } from 'firebase/auth';

export type UDSP = {
    protokol: DataSP,
    evidence: Raw<Data>,
}

type NahradniDil = {
    dil: SearchWidget<UDSP, SparePart>,
    mnozstvi: Pisatkova<UDSP>,
}

export type DataSP = {
    zasah: {
        datum: Pisatkova<UDSP>,
        clovek: Pisatkova<UDSP>,
        inicialy: Pisatkova<UDSP>,
        doba: Pisatkova<UDSP>,
        druh: MultiZaskrtavatkova<UDSP>,
        nahlasenaZavada: Pisatkova<UDSP>,
        popis: Pisatkova<UDSP>,
    },
    ukony: {
        nadpis: Nadpisova<UDSP>,
        doprava: Pisatkova<UDSP>,
        typPrace: Radiova<UDSP>,
        mnozstviPrace: Pisatkova<UDSP>,
        ukony: MultiZaskrtavatkova<UDSP>,
    },
    nahradniDily: {
        nadpis: Nadpisova<UDSP>,
        pocet: Pocitatkova<UDSP>,
    },
    nahradniDil1: NahradniDil,
    nahradniDil2: NahradniDil,
    nahradniDil3: NahradniDil,
    fakturace: {
        hotove: Vybiratkova<UDSP>,
        komu: Radiova<UDSP>,
        jak: Radiova<UDSP>,
    },
}

const nahradniDil = (show: (d: UDSP) => boolean): NahradniDil => ({
    dil: new SearchWidget({
        label: p`Položka`, show, required: show, items: [], getSearchItem: (i: SparePart) => ({
            pieces: [
                { text: p`${i.code.toString()}`, width: .08 },
                { text: p`${i.name}`, width: .8 },
                { text: p`${i.unitPrice.roundTo(2).toLocaleString('cs')} Kč`, width: .12 },
            ] as const,
        })
    }),
    mnozstvi: new Pisatkova({ nazev: p`Množství`, type: `number`, onError: `wrongNumberFormat`, zobrazit: show, text: '1' }),
});

export const defaultDataSP = (): DataSP => ({
    zasah: {
        datum: new Pisatkova({ nazev: p`Datum a čas zásahu`, type: 'datetime-local' }),
        clovek: new Pisatkova({ nazev: p`Jméno technika`, zobrazit: false, required: false }),
        inicialy: new Pisatkova({ nazev: p`Iniciály technika (do ID SP)`, zobrazit: false, required: false }),
        doba: new Pisatkova({ nazev: p`Celková doba zásahu (hodin)`, type: 'number', onError: `wrongNumberFormat` }),
        druh: new MultiZaskrtavatkova({
            nazev: p`Druh zásahu`,
            moznosti: [`commissioning`, `sp.yearlyCheck`, `sp.warrantyRepair`, `sp.postWarrantyRepair`, `sp.installationApproval`, `sp.otherType`]
        }),
        nahlasenaZavada: new Pisatkova({ nazev: p`Nahlášená závada`, required: false }),
        popis: new Pisatkova({ nazev: p`Popis zásahu`, required: false })
    },
    ukony: {
        nadpis: new Nadpisova({ nazev: p`Vyúčtování` }),
        doprava: new Pisatkova({ nazev: p`Doprava (km)`, type: 'number', onError: `wrongNumberFormat` }),
        typPrace: new Radiova({ nazev: p`Typ práce`, moznosti: [`sp.technicalAssistance`, `sp.assemblyWork`], required: false }),
        mnozstviPrace: new Pisatkova({
            nazev: p`Počet hodin práce`, type: 'number', onError: `wrongNumberFormat`,
            zobrazit: d => d.protokol.ukony.typPrace.value != null, required: d => d.protokol.ukony.typPrace.value != null
        }),
        ukony: new MultiZaskrtavatkova({
            nazev: p`Pracovní úkony (max. 3)`, max: 3, required: false, moznosti: [
                `sp.regulusRoute`, `sp.commissioningTC`, `sp.commissioningSOL`, `yearlyHPCheck`,
                `sp.yearlySOLCheck`, `sp.extendedWarranty`, `sp.installationApproval`,
            ]
        }),
    },
    nahradniDily: {
        nadpis: new Nadpisova({ nazev: p`Použité náhradní díly` }),
        pocet: new Pocitatkova({ nazev: p`Počet náhradních dílů`, min: 0, max: 3, vybrano: 0 }),
    },
    nahradniDil1: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 1),
    nahradniDil2: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 2),
    nahradniDil3: nahradniDil(d => d.protokol.nahradniDily.pocet.value >= 3),
    fakturace: {
        hotove: new Vybiratkova({ nazev: p`Placeno hotově`, moznosti: ['yes', 'no', 'doNotInvoice'] }),
        komu: new Radiova({
            nazev: p`Komu fakturovat`, moznosti: [p`Investor`, `assemblyCompany`],
            required: d => d.protokol.fakturace.hotove.value == 'no', zobrazit: d => d.protokol.fakturace.hotove.value == 'no',
        }),
        jak: new Radiova({
            nazev: p`Fakturovat`, moznosti: [p`Papírově`, p`Elektronicky`],
            required: d => d.protokol.fakturace.hotove.value == 'no', zobrazit: d => d.protokol.fakturace.hotove.value == 'no',
        }),
    },
});

export const sp = (() => {
    let i = $state() as number;
    const info: FormInfo<UDSP, DataSP, [[Technician[], User | null], [SparePart[]]]> = {
        storeName: 'stored_sp',
        defaultData: defaultDataSP,
        pdfLink: `installationProtocol-${i}`,
        getEditData: ir => {
            const editIndex = page.url.searchParams.get('edit') as string | null;
            if (editIndex) {
                i = Number(editIndex);
                return ir.installationProtocols[i]
            } else {
                i = ir.installationProtocols.length;
                return undefined
            }
        },
        saveData: (irid, raw, edit) => edit
            ? upravitServisniProtokol(irid, i, raw)
            : vyplnitServisniProtokol(irid, raw),
        createWidgetData: (evidence, protokol) => ({ evidence, protokol }),
        title: p`Instalační a servisní protokol`,
        editTitle: p`Editace SP`,
        onMount: async () => {
            await startTechniciansListening();
            await startSparePartsListening();
        },
        storeEffects: [
            [(p, [$techniciansList, $currentUser]) => {
                const ja = $techniciansList.find(t => $currentUser?.email == t.email);
                p.zasah.clovek.value = ja?.name ?? p.zasah.clovek.value;
                p.zasah.clovek.zobrazit = () => !ja;
                p.zasah.clovek.required = () => !ja;
                p.zasah.inicialy.value = ja?.initials ?? p.zasah.inicialy.value;
                p.zasah.inicialy.zobrazit = () => !ja;
                p.zasah.inicialy.required = () => !ja;
            }, [techniciansList, currentUser]],
            [(p, [$sparePartsList]) => {
                const spareParts = $sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) as SparePart);
                p.nahradniDil1.dil.items = () => spareParts;
                p.nahradniDil2.dil.items = () => spareParts;
                p.nahradniDil3.dil.items = () => spareParts;
            }, [sparePartsList]],
        ],
    };
    return info;
})();