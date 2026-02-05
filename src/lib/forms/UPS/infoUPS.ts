import type { FormInfo } from '$lib/forms/FormInfo';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { DataUPS, FormUPS } from '$lib/forms/UPS/formUPS';
import defaultUPS from './defaultUPS';
import { initDK, saveDK } from '$lib/forms/DK/formDK';
import { dayISO } from '$lib/helpers/date';
import db from '$lib/Database';

const infoUPS: FormInfo<DataUPS, FormUPS, [], 'UPS'> = ({
    type: 'IR',
    storeName: () => 'stored_solar_collector_commission',
    defaultData: defaultUPS,
    openPdf: () => ({
        link: 'UPS',
    }),
    saveData: async (irid, raw, edit, f, editResult, t, _, ir) => {
        await db.addSolarSystemCommissioningProtocol(irid, raw);
        await db.updateSolarSystemCommissionDate(irid, f.uvadeni.date.value);
        if (!edit) await saveDK(ir, f.checkRecommendations, 'SOL');
        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Změněno uvedení SOL do provozu k ${irName(ir.IN.ir)}`
                : `Vyplněno nové uvedení SOL do provozu k ${irName(ir.IN.ir)}`,
            component: MailProtocol,
            props: { name: user.email!, url: page.url.origin + detailIrUrl(irid), e: ir.IN },
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
    title: t => t.sol.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.UP.SOL } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.UP.SOL } : undefined,
    onMount: async (data, form, mode, ir) => {
        form.uvadeni.date.setValue(data, ir.UP.dateSOL || dayISO());
        initDK(data, mode, ir, 'SOL')
    },
});

export default infoUPS;