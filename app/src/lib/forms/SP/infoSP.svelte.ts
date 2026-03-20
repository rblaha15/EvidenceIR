import { startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { page } from '$app/state';
import { spName } from '$lib/helpers/ir';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { currentUser } from '$lib/client/auth';
import { cellsSP } from '$lib/forms/SP/cellsSP';
import { type DataSP, type FormSP } from '$lib/forms/SP/formSP.svelte';
import defaultSP from '$lib/forms/SP/defaultSP';
import type { FormInfo } from '$lib/forms/FormInfo';
import { dataToRawData, type Raw } from '$lib/forms/Form';
import { fieldsNSP } from '$lib/forms/NSP/fieldsNSP';
import { getIsOnline } from '$lib/client/realtimeOnline';
import db from '$lib/Database';
import { error } from '@sveltejs/kit';
import type { FormSZ } from '$lib/forms/SP/formSZ';

export const isSP = (raw: Raw<FormSP | FormSZ> | undefined): raw is Raw<FormSP> => !!raw && ('ukony' in raw)
export const ensureSP = (raw: Raw<FormSP | FormSZ> | undefined) => isSP(raw) ? raw : error(400, { message: 'Provided data is not a protocol' });

const infoSP: FormInfo<DataSP, FormSP, [[Technician[], User | null]], 'SP', { i: number }> = {
    type: 'IR',
    storeName: () => 'stored_sp',
    defaultData: () => defaultSP(),
    openPdf: ({ i }) => ({
        link: 'SP',
        index: i,
    }),
    getEditData: (ir, url) => {
        const editIndex = url.searchParams.get('edit') as string | null;
        if (editIndex) {
            const i = Number(editIndex);
            const sp = ir.SPs[i];
            return { raw: ensureSP(sp), other: { i } };
        }
    },
    getViewData: (ir, url) => {
        const viewIndex = url.searchParams.get('view') as string | null;
        if (viewIndex) {
            const i = Number(viewIndex);
            const sp = ir.SPs[i];
            return { raw: ensureSP(sp), other: { i } };
        } else {
            return { other: { i: ir.SPs.length } };
        }
    },
    saveData: async (irid, raw, edit, _, editResult, t, send, __, { i }) => {
        const name = spName(raw.zasah);
        const ir = (await db.getIR(irid))!;
        if (ir.deleted) return false

        if (!edit && getIsOnline() && ir.SPs.some(p => isSP(p) && spName(p.zasah) == name)) {
            editResult({ text: 'SP již existuje.', red: true, load: false });
            return false;
        }

        if (edit) await db.updateSP(irid, i, raw);
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
    createWidgetData: (_, p, ir) => ({
        ...p, ...ir, raw: dataToRawData<FormSP, Raw<FormSP>>(p), form: p,
    }),
    title: (t, mode) =>
        mode == 'edit' ? t.sp.editSP : t.sp.title,
    onMount: async (d, p, _, ir) => {
        await startTechniciansListening();
        await startSparePartsListening();
        if (!p.system.datumUvedeni.value && ir.UP.dateTC)
            p.system.datumUvedeni.setValue(d, ir.UP.dateTC);
    },
    storeEffects: [
        [(d, p, [$techniciansList, $currentUser], edit) => { // Also in NSP
            const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
            if (!p.zasah.clovek.value) p.zasah.clovek.setValue(d, ja?.name ?? p.zasah.clovek.value);
            if (!p.zasah.inicialy.value) p.zasah.inicialy.setValue(d, ja?.initials ?? p.zasah.inicialy.value);
            p.zasah.showNameFileds.setValue(d, p.zasah.clovek.value != ja?.name);
        }, [techniciansList, currentUser]],
    ],
    excelImport: {
        sheet: 'Protokol',
        onImport: (d, p) => {
            p.zasah.showNameFileds.setValue(d, true);
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