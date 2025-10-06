import { page } from '$app/state';
import db, { type Year } from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { dayISO } from '$lib/helpers/date';
import { type DataRK, type FormRK } from '$lib/forms/RK/formRK.js';
import defaultRK from '$lib/forms/RK/defaultRK';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { TC } from '$lib/forms/IN/defaultIN';
import { error } from '@sveltejs/kit';

const infoRK = (() => {
    let year = $state() as Year;
    const pump = (url: URL = page.url) => (url.searchParams.get('pump')?.toNumber() || error(400, 'Argument pump not valid or missing')) as TC;

    const info: FormInfo<DataRK, FormRK, [], 'RK'> = {
        type: 'IR',
        storeName: () => `stored_check-${pump()}`,
        defaultData: defaultRK,
        openPdf: () => ({
            link: 'RK',
            pump: pump(),
        }),
        getEditData: (ir, url) => {
            const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
            if (edit) {
                year = edit
                return ir.kontrolyTC[pump(url)]![edit];
            }
        },
        getViewData: (ir, url) => {
            const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
            if (view) {
                year = view
                return ir.kontrolyTC[pump(url)]![view];
            }
            else {
                const checks = ir.kontrolyTC[pump(url)] ?? {};
                year = checks?.[1]
                    ? (Math.max(...checks.keys().map(Number)) + 1) as Year
                    : 1;
                return undefined;
            }
        },
        saveData: async (irid, raw, edit, _, editResult, t, __, ir) => {
            const hp = pump();
            await db.addHeatPumpCheck(irid, hp, year, raw);

            if (await checkRegulusOrAdmin()) return;

            const user = get(currentUser)!;
            const response = await sendEmail({
                ...defaultAddresses(),
                subject: edit
                    ? `Vyplněna nová roční kontrola TČ${hp} k ${irName(ir.evidence.ir)}`
                    : `Upravena roční kontrola TČ${hp} k ${irName(ir.evidence.ir)}`,
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
        title: t => t.rk.formTitle({ n: `${pump()}` }),
        createWidgetData: () => {
        },
        subtitle: t => `${t.rk.year}: ${year.toString() ?? '…'}`,
        onMount: async (d, k) => {
            if (!k.info.datum.value)
                k.info.datum.setValue(d, dayISO());
        },
    };
    return info;
})();
export default infoRK;