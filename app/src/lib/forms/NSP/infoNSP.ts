import { getCachedUser, user, type User } from '$lib/client/auth';
import arrays, { type Technician } from '$lib/client/db/arrays';
import { appUrl } from '$lib/helpers/globals';
import { detailUrlNSP } from '$lib/helpers/runes.svelte.js';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { extractSPIDFromRawData, type NSPID, spName } from '$lib/helpers/ir';
import { type ContextNSP, defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import { fieldsNSP } from '$lib/forms/NSP/fieldsNSP';
import db from '$lib/client/db';
import { newNSP } from '$lib/data';

const infoNSP: IndependentFormInfo<ContextNSP, FormNSP, [[Technician[] | 'loading', User | null]], 'NSP'> = {
    type: '',
    storeName: () => 'stored_new_SP',
    form: defaultNSP,
    saveData: async ({ raw, edit, editResult, t, send }) => {
        const nspid = extractSPIDFromRawData(raw.zasah);

        const user = getCachedUser()!;

        if (edit) await db.updateNSP(nspid, raw);
        else await db.addNSP(newNSP(raw, user.email));

        if (edit && !send) return true;

        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Nový servisní protokol: ${spName(raw.zasah)}`,
            component: MailProtocol,
            props: { name: raw.zasah.clovek, url: appUrl + detailUrlNSP([nspid]), discountReason: raw.fakturace.discountReason, e: raw },
        });

        if (response!.ok) return true;
        else editResult({
            text: t.form.emailNotSent,
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
        await arrays.fetchTechnicians();
        await arrays.fetchSpareParts();
    },
    getEditData: async (url, fetch) => {
        const nspid = url.searchParams.get('edit-nspid') as NSPID | null;
        if (!nspid) return undefined;

        const sp = await db.getNSP(nspid, fetch);
        return !sp || sp.deleted ? undefined : { raw: sp.NSP };
    },
    getViewData: async (url, fetch) => {
        const nspid = url.searchParams.get('view-nspid') as NSPID | null;
        if (!nspid) return undefined;

        const sp = await db.getNSP(nspid, fetch);
        return !sp ? undefined : { raw: sp.NSP };
    },
    storeEffects: [
        [([$technicians, $currentUser], { values, edit }) => { // From SP
            const ja = edit || $technicians == 'loading' ? undefined
                : $technicians.find(t => $currentUser?.email == t.email);
            if (!values.zasah.clovek) values.zasah.clovek = ja?.name ?? values.zasah.clovek;
            if (!values.zasah.inicialy) values.zasah.inicialy = ja?.initials ?? values.zasah.inicialy;
            values.zasah.showNameFileds = values.zasah.clovek != ja?.name;
        }, [() => arrays.technicians, user]],
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