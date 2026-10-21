import { getCachedIsRegulusOrAdmin, getCachedUser, isRegulusOrAdmin } from '$lib/client/auth';
import db from '$lib/client/db';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import type { Raw } from '$lib/forms/Form';
import type { FormInfo } from '$lib/forms/FormInfo';
import defaultUPF from '$lib/forms/UPF/defaultUPF';
import type { ContextUPF, FormUPF } from '$lib/forms/UPF/formUPF';
import { appUrl } from '$lib/helpers/globals';
import { irName } from '$lib/helpers/ir';
import { detailUrlIR } from '$lib/helpers/runes.svelte';
import { derived } from 'svelte/store';

const infoUPF: FormInfo<ContextUPF, FormUPF, [], 'UPF'> = ({
    type: 'IR',
    storeName: () => 'stored_photovoltaic_power_plant_commission',
    form: (_, ir) => defaultUPF(ir.IN),
    openPdf: () => ({
        link: 'UPF',
    }),
    saveData: async ({ irid, raw, edit, editResult, t, ir }) => {
        await db.updateUPF(irid, raw);
        if (getCachedIsRegulusOrAdmin()) return;

        const user = getCachedUser()!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Změněno uvedení FVE do provozu k ${irName(ir.IN.ir)}`
                : `Vyplněno nové uvedení FVE do provozu k ${irName(ir.IN.ir)}`,
            component: MailProtocol,
            props: { name: user.email, url: appUrl + detailUrlIR(irid), e: ir.IN },
        });

        if (response!.ok) return;
        editResult({
            text: t.form.emailNotSent,
            red: true,
            load: false,
        });
        return false;
    },
    buttons: edit => derived(isRegulusOrAdmin, regulus => ({
        hideSave: !regulus,
        saveAndSend: !edit && !regulus,
        saveAndSendAgain: edit && !regulus,
    })),
    createContext: ({ values: v, form: f }) => ({ v, f }),
    title: t => t.fve.title,
    getEditData: (ir, url) =>
        url.searchParams.has('edit') ? { raw: ir.UP.FVE as Raw<FormUPF> } : undefined,
    getViewData: (ir, url) =>
        url.searchParams.has('view') ? { raw: ir.UP.FVE as Raw<FormUPF> } : undefined,
});

export default infoUPF;