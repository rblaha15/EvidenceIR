import {
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { currentUser } from '$lib/client/auth';
import { detailUrlNSP } from '$lib/helpers/runes.svelte.js';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { extractSPIDFromRawData, type NSPID, spName } from '$lib/helpers/ir';
import { type ContextNSP, defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import { fieldsNSP } from '$lib/forms/NSP/fieldsNSP';
import db from '$lib/client/db';
import { newNSP } from '$lib/data';
import { get } from 'svelte/store';

const infoNSP: IndependentFormInfo<ContextNSP, FormNSP, [[Technician[], User | null]], 'NSP'> = {
    type: '',
    storeName: () => 'stored_new_SP',
    form: defaultNSP,
    saveData: async ({ raw, edit, editResult, t, send }) => {
        const nspid = extractSPIDFromRawData(raw.zasah);

        const user = get(currentUser)!;

        if (edit) await db.updateNSP(nspid, raw);
        else await db.addNSP(newNSP(raw, user));

        if (edit && !send) return true;

        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Nový servisní protokol: ${spName(raw.zasah)}`,
            component: MailProtocol,
            props: { name: raw.zasah.clovek, url: page.url.origin + detailUrlNSP([nspid]), discountReason: raw.fakturace.discountReason, e: raw },
        });

        if (response!.ok) return true;
        else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    redirectLink: async raw => detailUrlNSP([extractSPIDFromRawData(raw.zasah)]),
    openPdf: async raw => ({
        link: 'NSP',
        nspid: extractSPIDFromRawData(raw.zasah),
        lang: 'cs',
    }),
    createContext: ({ values: v, form: f, mode }) => ({ v, f, edit: mode == 'edit' }),
    title: (t, m) => m == 'edit' ? t.sp.editSP : t.sp.title,
    onMount: async () => {
        await startTechniciansListening();
        await startSparePartsListening();
    },
    getEditData: async url => {
        const nspid = url.searchParams.get('edit-nspid') as NSPID | null;
        if (!nspid) return undefined;

        const sp = await db.getNSP(nspid);
        return !sp || sp.deleted ? undefined : { raw: sp.NSP };
    },
    getViewData: async url => {
        const nspid = url.searchParams.get('view-nspid') as NSPID | null;
        if (!nspid) return undefined;

        const sp = await db.getNSP(nspid);
        return !sp ? undefined : { raw: sp.NSP };
    },
    storeEffects: [
        [([$techniciansList, $currentUser], { values, edit }) => { // From SP
            const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
            if (!values.zasah.clovek) values.zasah.clovek = ja?.name ?? values.zasah.clovek;
            if (!values.zasah.inicialy) values.zasah.inicialy = ja?.initials ?? values.zasah.inicialy;
            values.zasah.showNameFileds = values.zasah.clovek != ja?.name;
        }, [techniciansList, currentUser]],
    ],
    pdfImport: {
        onImport: () => {},
        fields: fieldsNSP,
    },
    requiredRegulus: true,
    buttons: edit => ({
        hideBack: !edit,
        hideSave: !edit,
        saveAndSendAgain: edit,
        saveAndSend: !edit,
    }),
};

export default infoNSP;