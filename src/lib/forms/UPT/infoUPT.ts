import type { FormInfo } from '$lib/forms/FormInfo';
import defaultUPT from '$lib/forms/UPT/defaultUPT';
import db from '$lib/client/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { DataUPT, FormUPT } from '$lib/forms/UPT/formUPT';

const infoUPT: FormInfo<DataUPT, FormUPT, [], 'UPT'> = ({
    type: 'IR',
    storeName: 'stored_heat_pump_commission',
    defaultData: defaultUPT,
    openPdf: () => ({
        link: 'UPT',
    }),
    saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
        await db.addHeatPumpCommissioningProtocol(irid, raw);
        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Vyplněno nové uvedení TČ do provozu k ${irName(ir.evidence.ir)}`,
            component: MailProtocol,
            props: { name: user.email!, url: page.url.origin + detailIrUrl(irid) },
        });

        if (response!.ok) return;
        editResult({
            text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
        return false;
    },
    showSaveAndSendButtonByDefault: derived(isUserRegulusOrAdmin, i => !i),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: t => t.commissioning,
});

export default infoUPT;