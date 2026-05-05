import { startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { page } from '$app/state';
import { extractSPIDFromRawData, type SPID, spName, type SZID } from '$lib/helpers/ir';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { currentUser } from '$lib/client/auth';
import { cellsSP } from '$lib/forms/SP/cellsSP';
import { type ContextSP, type FormSP } from '$lib/forms/SP/formSP.svelte';
import defaultSP from '$lib/forms/SP/defaultSP';
import type { FormInfo } from '$lib/forms/FormInfo';
import { type Raw, valuesToRawData } from '$lib/forms/Form';
import { fieldsNSP } from '$lib/forms/NSP/fieldsNSP';
import { getIsOnline } from '$lib/client/realtimeOnline';
import db from '$lib/Database';
import { error } from '@sveltejs/kit';
import type { FormSZ } from '$lib/forms/SP/formSZ';

export const isSP = (raw: Raw<FormSP | FormSZ> | undefined): raw is Raw<FormSP> => !!raw && ('ukony' in raw)
export const ensureSP = (raw: Raw<FormSP | FormSZ> | undefined) => isSP(raw) ? raw : error(400, { message: 'Provided data is not a protocol' });

const infoSP: FormInfo<ContextSP, FormSP, [[Technician[], User | null]], 'SP'> = {
    type: 'IR',
    storeName: () => 'stored_sp',
    form: () => defaultSP(),
    openPdf: raw => ({
        link: 'SP',
        id: extractSPIDFromRawData(raw.zasah),
    }),
    getEditData: (ir, url) => {
        const editID = url.searchParams.get('edit') as SPID | SZID | null;
        if (editID) {
            const sp = ir.SPs[editID];
            return { raw: ensureSP(sp) };
        }
    },
    getViewData: (ir, url) => {
        const viewID = url.searchParams.get('view') as SPID | SZID | null;
        if (viewID) {
            const sp = ir.SPs[viewID];
            return { raw: ensureSP(sp) };
        }
    },
    saveData: async ({ irid, raw, edit, editResult, t, send }) => {
        const name = spName(raw.zasah);
        const ir = (await db.getIR(irid))!;
        if (ir.deleted) return false;

        if (!edit && getIsOnline() && ir.SPs.keys().includes(extractSPIDFromRawData(raw.zasah))) {
            editResult({ text: 'SP již existuje.', red: true, load: false });
            return false;
        }

        if (edit) await db.updateSP(irid, raw);
        else await db.addSPs(irid, raw);

        if (!ir.UP.dateTC) await db.updateDateUPT(irid, raw.system.datumUvedeni);

        if (edit && !send) return true;

        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Upravený servisní protokol: ${name}`
                : `Nový servisní protokol: ${name}`,
            component: MailProtocol,
            props: { name: raw.zasah.clovek, url: page.url.origin + detailIrUrl(irid), discountReason: raw.fakturace.discountReason, e: ir.IN },
        });

        if (response!.ok) return true;
        else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    buttons: edit => ({
        hideSave: !edit,
        saveAndSendAgain: edit,
        saveAndSend: !edit,
    }),
    createContext: ({ values: v, form: f, ir, mode }) => ({ ir, f, v, raw: valuesToRawData(f, v), edit: mode == 'edit' }),
    title: (t, mode) =>
        mode == 'edit' ? t.sp.editSP : t.sp.title,
    onMount: async ({ values, ir }) => {
        await startTechniciansListening();
        await startSparePartsListening();
        if (!values.system.datumUvedeni && ir.UP.dateTC)
            values.system.datumUvedeni = ir.UP.dateTC;
    },
    storeEffects: [
        [([$techniciansList, $currentUser], { values, edit }) => { // Also in NSP
            const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
            if (!values.zasah.clovek) values.zasah.clovek = ja?.name ?? values.zasah.clovek;
            if (!values.zasah.inicialy) values.zasah.inicialy = ja?.initials ?? values.zasah.inicialy;
            values.zasah.showNameFileds = values.zasah.clovek != ja?.name;
        }, [techniciansList, currentUser]],
    ],
    excelImport: {
        sheet: 'Protokol',
        onImport: (d, p) => {
            p.zasah.showNameFileds = true;
        },
        cells: cellsSP,
        sheetFilter: n => n.includes('Protokol'),
    },
    pdfImport: {
        onImport: () => {
        },
        fields: fieldsNSP,
    },
    requiredRegulus: true,
};

export default infoSP;