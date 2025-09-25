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

const infoUPS: FormInfo<DataUPS, FormUPS, [], 'UPS'> = ({
    type: 'IR',
    storeName: () => 'stored_solar_collector_commission',
    defaultData: defaultUPS,
    openPdf: () => ({
        link: 'UPS',
    }),
    saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
        await db.addSolarSystemCommissioningProtocol(irid, raw);
        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Vyplněno nové uvedení SOL do provozu k ${irName(ir.evidence.ir)}`,
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
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: t => t.sol.title,
});
export default infoUPS;