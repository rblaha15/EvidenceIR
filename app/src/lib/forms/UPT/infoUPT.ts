import type { FormInfo } from '$lib/forms/FormInfo';
import defaultUPT from '$lib/forms/UPT/defaultUPT';
import db from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { DataUPT, FormUPT } from '$lib/forms/UPT/formUPT';
import { initDK, saveDK } from '$lib/forms/DK/formDK';
import type { Widget } from '$lib/forms/Widget.svelte';
import type { Raw } from '$lib/forms/Form';
import { grantPoints } from '$lib/client/loyaltyProgram';
import { dayISO, today } from '$lib/helpers/date';

const infoUPT: FormInfo<DataUPT, FormUPT, [], 'UPT'> = {
    type: 'IR',
    storeName: () => 'stored_heat_pump_commission',
    defaultData: defaultUPT,
    openPdf: () => ({
        link: 'UPT',
    }),
    saveData: async (irid, raw, edit, f, editResult, t, _, ir) => {
        await db.updateHeatPumpCommissioningProtocol(irid, raw);
        await db.updateHeatPumpCommissionDate(irid, f.uvadeni.date.value);
        if (!edit) await saveDK(ir, f.checkRecommendations, 'TČ');

        await grantPoints({ type: 'heatPumpCommission', irid });

        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Změněno uvedení TČ do provozu k ${irName(ir.evidence.ir)}`
                : `Vyplněno nové uvedení TČ do provozu k ${irName(ir.evidence.ir)}`,
            component: MailProtocol,
            props: { name: user.email!, url: page.url.origin + detailIrUrl(irid) },
        });

        if (response!.ok) return;
        editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
        return false;
    },
    buttons: edit => derived(isUserRegulusOrAdmin, regulus => ({
        hideSave: !regulus,
        saveAndSend: !edit && !regulus,
        saveAndSendAgain: edit && !regulus,
    })),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence, dk: uvedeni.checkRecommendations }),
    title: t => t.tc.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.uvedeniTC as Raw<FormUPT> } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.uvedeniTC as Raw<FormUPT> } : undefined,
    onMount: async (data, form, mode, ir) => {
        form.uvadeni.date.setValue(data, ir.heatPumpCommissionDate || dayISO());
        initDK(data, mode, ir, 'TČ');
    },
};

export default infoUPT;