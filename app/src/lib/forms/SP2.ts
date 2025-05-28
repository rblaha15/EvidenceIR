import { defaultDataSP, type GenericDataSP } from '$lib/forms/SP.svelte';
import type { UserData } from '$lib/forms/Data';
import { userData } from '$lib/forms/defaultData';
import { InputWidget, TitleWidget } from '$lib/Widget.svelte';
import type { DetachedFormInfo } from '$lib/forms/forms.svelte';
import {
    type FriendlyCompanies,
    type SparePart,
    sparePartsList,
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { extractSPIDFromRawData, vyplnitObecnyServisniProtokol } from '$lib/client/firestore';
import { currentUser } from '$lib/client/auth';
import { relUrl } from '$lib/helpers/runes.svelte';
import { type Form } from '$lib/forms/Form';
import { nowISO, todayISO } from '$lib/helpers/date';
import { companies } from '$lib/helpers/companies';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { spName } from '$lib/helpers/ir';
import { p } from '$lib/translations';

export type UDSP = UserData<UDSP> & GenericDataSP<UDSP>

export interface DataSP2 extends GenericDataSP<UDSP>, UserData<UDSP>, Form<UDSP> {
    system: {
        nadpis: TitleWidget<UDSP>;
        popis: InputWidget<UDSP>;
        datumUvedeni: InputWidget<UDSP>;
    };
}

export const defaultDataSP2 = (): DataSP2 => ({
    ...userData(),
    system: {
        nadpis: new TitleWidget({ text: p('Instalační a servisní protokol') }),
        popis: new InputWidget({ label: p('Popis systému'), textArea: true, required: true }),
        datumUvedeni: new InputWidget({ label: p('Datum uvedení do provozu'), type: 'date', required: false }),
    },
    ...defaultDataSP(),
});

const sp2: DetachedFormInfo<UDSP, DataSP2, [[Technician[], User | null], [SparePart[]], [FriendlyCompanies]]> = {
    storeName: 'stored_new_SP',
    defaultData: defaultDataSP2,
    getEditData: async () => undefined,
    saveData: async (raw, _, __, editResult, t) => {
        await vyplnitObecnyServisniProtokol(raw);

        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Nový servisní protokol: ${spName(raw.zasah)}`,
            component: MailProtocol,
            props: { name: raw.zasah.clovek, origin: page.url.origin, irid_spid: extractSPIDFromRawData(raw.zasah) },
        });

        if (response!.ok) return true;
        else editResult({
            text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
    },
    redirectLink: async () => relUrl(),
    openTabLink: async raw => relUrl(`/detail/${extractSPIDFromRawData(raw.zasah)}`),
    createWidgetData: f => f,
    title: () => `Instalační a servisní protokol`,
    onMount: async (d, f) => {
        await startTechniciansListening();
        await startSparePartsListening();
        f.zasah.datum.setValue(d, nowISO());
        if (!f.system.datumUvedeni.value)
            f.system.datumUvedeni.setValue(d, todayISO());
    },
    storeEffects: [
        [(d, f, [$techniciansList, $currentUser]) => {
            f.uvedeni.regulus.items = () => $techniciansList.filter(t => t.email.endsWith('cz'));

            const ja = $techniciansList.find(t => $currentUser?.email == t.email);
            f.zasah.clovek.setValue(d, ja?.name ?? f.zasah.clovek.value);
            f.zasah.clovek.show = () => !ja;
            f.zasah.clovek.required = () => !ja;
            f.zasah.inicialy.setValue(d, ja?.initials ?? f.zasah.inicialy.value);
            f.zasah.inicialy.show = () => !ja;
            f.zasah.inicialy.required = () => !ja;
        }, [techniciansList, currentUser]],
        [(_, f, [$sparePartsList]) => {
            const spareParts = $sparePartsList.map(it => ({
                ...it,
                name: it.name.replace('  ', ' '),
            }) satisfies SparePart);
            [
                f.nahradniDil1, f.nahradniDil2, f.nahradniDil3, f.nahradniDil4,
                f.nahradniDil5, f.nahradniDil6, f.nahradniDil7, f.nahradniDil8,
            ].forEach(nahradniDil => {
                nahradniDil.dil.items = () => spareParts;
            });
        }, [sparePartsList]],
        [(_, f, [$companies]) => {
            f.uvedeni.company.items = () => $companies.commissioningCompanies;
            f.montazka.company.items = () => $companies.assemblyCompanies;
        }, [companies]],
    ],
};

export default sp2;