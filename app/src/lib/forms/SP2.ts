import { compactOtherSpareData, defaultDataSP, type GenericDataSP, otherPart, updateOtherSpareParts } from '$lib/forms/SP.svelte';
import type { UserData } from '$lib/forms/Data';
import { userData } from '$lib/forms/defaultData';
import { InputWidget, p, TitleWidget } from '$lib/Widget.svelte';
import type { DetachedFormInfo } from '$lib/forms/forms.svelte';
import {
    type FriendlyCompanies,
    type SparePart, sparePartsList,
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { extractSPIDFromRawData, vyplnitObecnyServisniProtokol } from '$lib/client/firestore';
import { currentUser, getToken } from '$lib/client/auth';
import { relUrl } from '$lib/helpers/runes.svelte';
import { dataToRawData, type Form } from '$lib/forms/Form';
import { nowISO, todayISO } from '$lib/helpers/date';
import { companies } from '$lib/helpers/companies';

export type UDSP2 = {
    protokol: DataSP2,
    d: DataSP2,
}

export interface DataSP2 extends GenericDataSP<UDSP2>, UserData<UDSP2>, Form<UDSP2> {
    system: {
        nadpis: TitleWidget<UDSP2>;
        popis: InputWidget<UDSP2>;
        datumUvedeni: InputWidget<UDSP2>;
    }
}

export const defaultDataSP2 = (): DataSP2 => ({
    ...userData(),
    system: {
        nadpis: new TitleWidget({ text: p`Instalační a servisní protokol` }),
        popis: new InputWidget({ label: p`Popis systému`, textArea: true, required: true }),
        datumUvedeni: new InputWidget({ label: p`Datum uvedení do provozu`, type: 'date', required: false }),
    },
    ...defaultDataSP(),
})

const sp2: DetachedFormInfo<UDSP2, DataSP2, [[Technician[], User | null], [SparePart[]], [FriendlyCompanies]]> = {
    storeName: 'stored_new_SP',
    defaultData: defaultDataSP2,
    getEditData: async () => undefined,
    saveData: async (raw, _, data, editResult) => {
        compactOtherSpareData<UDSP2, DataSP2>(data, raw);
        await vyplnitObecnyServisniProtokol(raw)

        editResult({
            text: 'Přesměrování...',
            red: false,
            load: true
        });

        const token = await getToken();
        const newWin = window.open(
            relUrl(`/detail/${extractSPIDFromRawData(raw)}/pdf/publicInstallationProtocol?token=${token}`)
        );
        if (!newWin || newWin.closed) {
            editResult({
                text: 'Povolte prosím otevírání oken v prohlížeči',
                red: true,
                load: false
            });
        } else {
            window.location.replace(relUrl());
        }
    },
    storeData: f => {
        const raw = dataToRawData(f);
        compactOtherSpareData<UDSP2, DataSP2>(f, raw);
        return raw;
    },
    createWidgetData: f => ({ protokol: f, d: f }),
    title: () => `Instalační a servisní protokol`,
    onMount: async (d, f) => {
        await startTechniciansListening();
        await startSparePartsListening();
        if (!f.zasah.datum.value)
            f.zasah.datum.setValue(d, nowISO());
        if (!f.system.datumUvedeni.value)
            f.system.datumUvedeni.setValue(d, todayISO());
    },
    storeEffects: [
        [(d, f, [$techniciansList, $currentUser]) => {
            f.uvedeni.regulus.items = () => $techniciansList

            const ja = $techniciansList.find(t => $currentUser?.email == t.email);
            f.zasah.clovek.setValue(d, ja?.name ?? f.zasah.clovek.value);
            f.zasah.clovek.show = () => !ja;
            f.zasah.clovek.required = () => !ja;
            f.zasah.inicialy.setValue(d, ja?.initials ?? f.zasah.inicialy.value);
            f.zasah.inicialy.show = () => !ja;
            f.zasah.inicialy.required = () => !ja;
        }, [techniciansList, currentUser]],
        [(d, f, [$sparePartsList]) => {
            const spareParts = [otherPart, ...$sparePartsList.map(it => ({
                ...it,
                name: it.name.replace('  ', ' '),
            }) as SparePart)];
            [f.nahradniDil1, f.nahradniDil2, f.nahradniDil3].forEach(nahradniDil => {
                nahradniDil.dil.items = () => spareParts;
            });
            updateOtherSpareParts(d, spareParts);
        }, [sparePartsList]],
        [(_, f, [$companies]) => {
            f.uvedeni.company.items = () => $companies.commissioningCompanies;
            f.montazka.company.items = () => $companies.assemblyCompanies;
        }, [companies]],
    ],
};

export default sp2