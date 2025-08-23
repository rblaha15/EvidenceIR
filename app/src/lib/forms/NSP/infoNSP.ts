import { unknownCompany } from '$lib/forms/IN/formIN';
import {
    type FriendlyCompanies,
    type SparePart,
    sparePartsList,
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { currentUser } from '$lib/client/auth';
import { detailSpUrl } from '$lib/helpers/runes.svelte.js';
import { nowISO } from '$lib/helpers/date';
import { companies } from '$lib/helpers/companies';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { extractSPIDFromRawData, type SPID, spName } from '$lib/helpers/ir';
import db from '$lib/data';
import { type DataNSP, defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';

const infoNSP: IndependentFormInfo<DataNSP, FormNSP, [[Technician[], User | null], [SparePart[]], [FriendlyCompanies]], 'NSP'> = {
    type: '',
    storeName: 'stored_new_SP',
    defaultData: defaultNSP,
    saveData: async (raw, edit, _, editResult, t, send) => {
        if (edit) await db.updateIndependentServiceProtocol(raw);
        else await db.addIndependentServiceProtocol(raw);

        if (edit && !send) return true;

        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Nový servisní protokol: ${spName(raw.zasah)}`,
            component: MailProtocol,
            props: { name: raw.zasah.clovek, url: page.url.origin + detailSpUrl([extractSPIDFromRawData(raw.zasah)]) },
        });

        if (response!.ok) return true;
        else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    showSaveAndSendButtonByDefault: true,
    isSendingEmails: true,
    redirectLink: async raw => detailSpUrl([extractSPIDFromRawData(raw.zasah)]),
    openPdf: async raw => ({
        link: 'NSP',
        spid: extractSPIDFromRawData(raw.zasah),
        lang: 'cs',
    }),
    createWidgetData: f => f,
    title: (t, m) => m == 'edit' ? t.sp.editSP : t.sp.title,
    onMount: async (d, f) => {
        await startTechniciansListening();
        await startSparePartsListening();
        if (!f.zasah.datum.value)
            f.zasah.datum.setValue(d, nowISO());
    },
    getEditData: async url => {
        const spid = url.searchParams.get('edit-spid') as SPID | null;
        if (!spid) return undefined;

        return await db.getIndependentProtocol(spid);
    },
    getViewData: async url => {
        const spid = url.searchParams.get('view-spid') as SPID | null;
        if (!spid) return undefined;

        const sp = await db.getIndependentProtocol(spid);
        return !sp ? undefined : sp;
    },
    storeEffects: [
        [(d, f, [$techniciansList, $currentUser], edit) => {
            f.uvedeni.regulus.items = () => $techniciansList.filter(t => t.email.endsWith('cz'));

            const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
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
            f.montazka.company.items = () => [unknownCompany, ...$companies.assemblyCompanies];
        }, [companies]],
    ],
    requiredRegulus: true,
    hideBackButton: edit => !edit,
};

export default infoNSP;