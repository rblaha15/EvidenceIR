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
import { saveDK } from '$lib/forms/DK/formDK';
import type { Widget } from '$lib/forms/Widget.svelte';

const infoUPT: FormInfo<DataUPT, FormUPT, [], 'UPT'> = ({
    type: 'IR',
    storeName: () => 'stored_heat_pump_commission',
    defaultData: defaultUPT,
    openPdf: () => ({
        link: 'UPT',
    }),
    saveData: async (irid, raw, edit, f, editResult, t, _, ir) => {
        await db.addHeatPumpCommissioningProtocol(irid, raw);
        if (!edit) await saveDK(ir, f.checkRecommendations, 'TČ')
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
    showSaveAndSendButtonByDefault: derived(isUserRegulusOrAdmin, i => !i),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence, dk: uvedeni.checkRecommendations }),
    title: t => t.tc.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? ir.uvedeniTC : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? ir.uvedeniTC : undefined,
    onMount: async (_, data, mode) => {
        if (mode != 'create') {
            (data.checkRecommendations as Record<string, Widget>).getValues().forEach(e => {
                e.show = () => false;
            })
        }
    },
});

export default infoUPT;