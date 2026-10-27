import { getCachedUser } from '$lib/client/auth';
import db from '$lib/client/db';
import { updates } from '$lib/client/db/performChange';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import type { ExistingIR, IR } from '$lib/data';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { checkForDocumentChanges } from '$lib/features/signing/actions/changes';
import { saveDK } from '$lib/forms/DK/formDK';
import type { Raw, Values } from '$lib/forms/Form';
import type { FormInfo, Result } from '$lib/forms/FormInfo';
import defaultUPT from '$lib/forms/UPT/defaultUPT';
import type { ContextUPT, FormUPT } from '$lib/forms/UPT/formUPT';
import { nowISO } from '$lib/helpers/date';
import { appUrl } from '$lib/helpers/globals';
import { type IRID, irName } from '$lib/helpers/ir';
import { detailUrlIR } from '$lib/helpers/runes.svelte';
import { pdfInfo } from '$lib/pdf/pdf';
import type { Translations } from '$lib/translations';

const commitTheChange = async (
    raw: Raw<FormUPT>, values: Values<FormUPT>, ir: IR, irid: IRID,
    edit: boolean, editResult: (r: Result) => void, t: Translations,
) => {
    // Also set in mongo write db
    if (!edit) raw.uvadeni.createdAt = nowISO(true);
    if (!edit) raw.uvadeni.createdBy = getCachedUser()!.email;
    await db.updateDateUPT(irid, values.tc.date);
    await db.updateUPT(irid, raw);
    if (!edit) await saveDK(ir, values.checkRecommendations, 'TČ');

    const user = getCachedUser()!;
    const response = await sendEmail({
        ...defaultAddresses(),
        subject: edit
            ? `Změněno uvedení TČ do provozu k ${irName(ir.IN.ir)}`
            : `Vyplněno nové uvedení TČ do provozu k ${irName(ir.IN.ir)}`,
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
};
const infoUPT: FormInfo<ContextUPT, FormUPT, [], 'UPT'> = {
    type: 'IR',
    storeName: () => 'stored_heat_pump_commission',
    form: (_, ir) => defaultUPT(ir),
    openPdf: () => ({
        link: 'UPT',
    }),
    saveData: async ({ irid, raw, edit, values, editResult, t, ir }) => {
        const changedPdfs = ir.deleted ? [] : await checkForDocumentChanges<'IR'>(ir, ir =>
            updates.updateUPT(ir, raw) as ExistingIR,
        );

        if (changedPdfs.length) return editResult({
            red: true, load: false,
            text: `Pokud uložíte tato data, odebere se podpis od dokumentů níže. Chcete pokračovat?`, // TODO translation
            error: changedPdfs.map(def => pdfInfo[def.pdf].title(t) + (def.parameter ? ` (${def.parameter})` : '')).join('\n'),
            confirm: {
                text: 'Ano, uložit a odstranit podpisy',
                onclick: () => commitTheChange(
                    raw, values, ir, irid,
                    edit, editResult, t,
                ),
            },
        });

        return await commitTheChange(
            raw, values, ir, irid,
            edit, editResult, t,
        );
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