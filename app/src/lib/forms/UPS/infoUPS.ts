import type { FormInfo } from '$lib/forms/FormInfo';
import db from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { DataUPS, FormUPS } from '$lib/forms/UPS/formUPS';
import defaultUPS from './defaultUPS';
import { saveDK } from '$lib/forms/DK/formDK';
import type { Widget } from '$lib/forms/Widget.svelte';

const infoUPS: FormInfo<DataUPS, FormUPS, [], 'UPS'> = ({
    type: 'IR',
    storeName: () => 'stored_solar_collector_commission',
    defaultData: defaultUPS,
    openPdf: () => ({
        link: 'UPS',
    }),
    saveData: async (irid, raw, edit, f, editResult, t, _, ir) => {
        await db.addSolarSystemCommissioningProtocol(irid, raw);
        if (!edit) await saveDK(ir, f.checkRecommendations, 'SOL')
        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Změněno uvedení SOL do provozu k ${irName(ir.evidence.ir)}`
                : `Vyplněno nové uvedení SOL do provozu k ${irName(ir.evidence.ir)}`,
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
        hideSave: !edit && !regulus,
        saveAndSend: !edit && !regulus,
        saveAndSendAgain: edit && !regulus,
    })),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence, dk: uvedeni.checkRecommendations }),
    title: t => t.sol.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.uvedeniSOL } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.uvedeniSOL } : undefined,
    onMount: async (_, data, mode) => {
        if (mode != 'create') {
            (data.checkRecommendations as Record<string, Widget>).getValues().forEach(e => {
                e.show = () => false;
            })
        }
    },
});

export default infoUPS;