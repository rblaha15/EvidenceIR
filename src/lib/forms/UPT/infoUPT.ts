import type { FormInfo } from '$lib/forms/FormInfo';
import defaultUPT from '$lib/forms/UPT/defaultUPT';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { ContextUPT, FormUPT } from '$lib/forms/UPT/formUPT';
import { saveDK } from '$lib/forms/DK/formDK';
import type { Raw } from '$lib/forms/Form';
import { grantPoints } from '$lib/client/loyaltyProgram';
import db from '$lib/Database';

const infoUPT: FormInfo<ContextUPT, FormUPT, [], 'UPT'> = {
    type: 'IR',
    storeName: () => 'stored_heat_pump_commission',
    form: (_, ir) => defaultUPT(ir),
    openPdf: () => ({
        link: 'UPT',
    }),
    saveData: async ({ irid, raw, edit, values, editResult, t, ir }) => {
        await db.updateUPT(irid, raw);
        await db.updateDateUPT(irid, values.uvadeni.date);
        if (!edit) await saveDK(ir, values.checkRecommendations, 'TČ');

        await grantPoints({ type: 'heatPumpCommission', irid });

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Změněno uvedení TČ do provozu k ${irName(ir.IN.ir)}`
                : `Vyplněno nové uvedení TČ do provozu k ${irName(ir.IN.ir)}`,
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
    createContext: ({ IN, values: UP, mode, ir, form }) =>
        ({ UP, IN, DK: UP.checkRecommendations, mode, ir, form }),
    title: t => t.tc.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.UP.TC as Raw<FormUPT> } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.UP.TC as Raw<FormUPT> } : undefined,
};

export default infoUPT;