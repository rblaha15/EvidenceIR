import { getIsOnline, startSparePartsListening, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { page } from '$app/state';
import { spName } from '$lib/helpers/ir';
import db from '$lib/data';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { nowISO } from '$lib/helpers/date';
import { currentUser } from '$lib/client/auth';
import { cellsSP } from '$lib/forms/SP/cellsSP';
import { type DataSP, type FormSP } from '$lib/forms/SP/formSP.svelte';
import defaultSP from '$lib/forms/SP/defaultSP';
import type { FormInfo } from '$lib/forms/FormInfo';
import { dataToRawData, type Raw } from '$lib/forms/Form';

const infoSP = (() => {
    let i = $state() as number;
    const info: FormInfo<DataSP, FormSP, [[Technician[], User | null]], 'SP'> = {
        type: 'IR',
        storeName: () => 'stored_sp',
        defaultData: () => defaultSP(),
        openPdf: () => ({
            link: 'SP',
            index: i,
        }),
        getEditData: (ir, url) => {
            const editIndex = url.searchParams.get('edit') as string | null;
            if (editIndex) {
                i = Number(editIndex);
                return ir.installationProtocols[i];
            }
        },
        getViewData: (ir, url) => {
            const viewIndex = url.searchParams.get('view') as string | null;
            if (viewIndex) {
                i = Number(viewIndex);
                return ir.installationProtocols[i];
            } else {
                i = ir.installationProtocols.length;
                return undefined;
            }
        },
        saveData: async (irid, raw, edit, _, editResult, t, send) => {
            const name = spName(raw.zasah);
            const ir = (await db.getIR(irid))!;

            if (!edit && getIsOnline() && ir.installationProtocols.some(p => spName(p.zasah) == name)) {
                editResult({ text: 'SP již existuje.', red: true, load: false });
                return false;
            }

            if (edit) await db.updateServiceProtocol(irid, i, raw);
            else await db.addServiceProtocol(irid, raw);

            if (!ir.uvedeniTC.uvadeni.date) await db.updateHeatPumpCommissioningProtocol
            (irid, { uvadeni: { date: raw.system.datumUvedeni } });

            if (edit && !send) return true;

            const response = await sendEmail({
                ...defaultAddresses(),
                subject: edit
                    ? `Upravený servisní protokol: ${name}`
                    : `Nový servisní protokol: ${name}`,
                component: MailProtocol,
                props: { name: raw.zasah.clovek, url: page.url.origin + detailIrUrl(irid) },
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
        createWidgetData: (_, p, ir) => ({
            ...p, ...ir, raw: dataToRawData<FormSP, Raw<FormSP>>(p), form: p,
        }),
        title: (t, mode) =>
            mode == 'edit' ? t.sp.editSP : t.sp.title,
        onMount: async (d, p, _, ir) => {
            await startTechniciansListening();
            await startSparePartsListening();
            if (!p.zasah.datum.value) // Also in NSP
                p.zasah.datum.setValue(d, nowISO());
            if (!p.system.datumUvedeni.value && ir.uvedeniTC.uvadeni.date) {
                p.system.datumUvedeni.setValue(d, ir.uvedeniTC.uvadeni.date);
            }
        },
        storeEffects: [
            [(d, p, [$techniciansList, $currentUser], edit) => { // Also in NSP
                const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
                if (!p.zasah.clovek.value) p.zasah.clovek.setValue(d, ja?.name ?? p.zasah.clovek.value);
                p.zasah.clovek.show = () => p.zasah.clovek.value != ja?.name;
                if (!p.zasah.inicialy.value) p.zasah.inicialy.setValue(d, ja?.initials ?? p.zasah.inicialy.value);
                p.zasah.inicialy.show = () => p.zasah.inicialy.value != ja?.initials;
            }, [techniciansList, currentUser]],
        ],
        excelImport: {
            sheet: 'Protokol',
            onImport: (_, p) => {
                p.zasah.clovek.show = () => true;
                p.zasah.inicialy.show = () => true;
            },
            cells: cellsSP,
            sheetFilter: n => n.includes('Protokol'),
        },
        requiredRegulus: true,
    };
    return info;
})();

export default infoSP;