import {
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { detailSpUrl } from '$lib/helpers/runes.svelte.js';
import { nowISO } from '$lib/helpers/date';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { extractSPIDFromRawData, type SPID, spName } from '$lib/helpers/ir';
import db from '$lib/data';
import { type DataNSP, defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import { fieldsNSP } from '$lib/forms/NSP/fieldsNSP';

const infoNSP: IndependentFormInfo<DataNSP, FormNSP, [[boolean], [Technician[], User | null]], 'NSP'> = {
    type: '',
    storeName: () => 'stored_new_SP',
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
    redirectLink: async raw => detailSpUrl([extractSPIDFromRawData(raw.zasah)]),
    openPdf: async raw => ({
        link: 'NSP',
        spid: extractSPIDFromRawData(raw.zasah),
        lang: 'cs',
    }),
    createWidgetData: f => f,
    title: (t, m) => m == 'edit' ? t.sp.editSP : t.sp.title,
    onMount: async (d, f, mode) => {
        await startTechniciansListening();
        await startSparePartsListening();

        f.zasah.inicialy.lock = () => mode == 'edit';
        f.zasah.datum.lock = () => mode == 'edit';

        if (!f.zasah.datum.value) // Also in SP
            f.zasah.datum.setValue(d, nowISO());
    },
    getEditData: async url => {
        const spid = url.searchParams.get('edit-spid') as SPID | null;
        if (!spid) return undefined;

        return { raw: await db.getIndependentProtocol(spid) };
    },
    getViewData: async url => {
        const spid = url.searchParams.get('view-spid') as SPID | null;
        if (!spid) return undefined;

        const sp = await db.getIndependentProtocol(spid);
        return !sp ? undefined : { raw: sp };
    },
    storeEffects: [
        [(_, data, [$isUserRegulusOrAdmin]) => { // From IN
            data.koncovyUzivatel.company.show = d => $isUserRegulusOrAdmin && d.koncovyUzivatel.typ.value == 'company';
            data.koncovyUzivatel.or.show = d => $isUserRegulusOrAdmin && d.koncovyUzivatel.typ.value == 'company';
        }, [isUserRegulusOrAdmin]],
        [(_, f, [$techniciansList, $currentUser], edit) => { // From SP
            const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
            if (!f.zasah.clovek.value) f.zasah.clovek.setValue(f, ja?.name ?? f.zasah.clovek.value);
            f.zasah.clovek.show = () => f.zasah.clovek.value != ja?.name;
            if (!f.zasah.inicialy.value) f.zasah.inicialy.setValue(f, ja?.initials ?? f.zasah.inicialy.value);
            f.zasah.inicialy.show = () => f.zasah.inicialy.value != ja?.initials;
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