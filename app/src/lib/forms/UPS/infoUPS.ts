import type { FormInfo } from '$lib/forms/FormInfo';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { ContextUPS, FormUPS } from '$lib/forms/UPS/formUPS';
import defaultUPS from './defaultUPS';
import { saveDK } from '$lib/forms/DK/formDK';
import db from '$lib/Database';

const infoUPS: FormInfo<ContextUPS, FormUPS, [], 'UPS'> = ({
    type: 'IR',
    storeName: () => 'stored_solar_collector_commission',
    form: (_, ir) => defaultUPS(ir),
    openPdf: () => ({
        link: 'UPS',
    }),
    saveData: async ({ irid, raw, edit, values, editResult, t, ir }) => {
        await db.addUPS(irid, raw);
        await db.updateDateUPS(irid, values.uvadeni.date);
        if (!edit) await saveDK(ir, values.checkRecommendations, 'SOL');
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
    createContext: ({ IN, values: UP, mode }) => ({ UP, IN, DK: UP.checkRecommendations, mode }),
    title: t => t.sol.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.UP.SOL } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.UP.SOL } : undefined,
});

export default infoUPS;