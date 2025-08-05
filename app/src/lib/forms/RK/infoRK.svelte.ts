import { page } from '$app/state';
import db, { type Year } from '$lib/client/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { todayISO } from '$lib/helpers/date';
import { type DataRK, type FormRK } from '$lib/forms/RK/formRK.js';
import defaultRK from '$lib/forms/RK/defaultRK';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { TC } from '$lib/forms/IN/defaultIN';

const infoRK = (() => {
    let rok = $state() as number;
    const tc = (url: URL = page.url) => (url.searchParams.get('tc')?.let(Number) ?? 1) as TC;

    const info: FormInfo<DataRK, FormRK, [], 'RK'> = {
        type: 'IR',
        storeName: 'stored_check',
        defaultData: defaultRK,
        openPdf: () => ({
            link: 'RK',
            pump: tc(),
        }),
        getEditData: (ir, url) => {
            console.log(ir.kontrolyTC, tc(url));
            const kontroly = ir.kontrolyTC[tc(url)] ?? {};
            rok = kontroly?.[1] == undefined ? 1
                : Math.max(...kontroly.keys().map(Number)) + 1;
            return undefined;
        },
        saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
            await db.addHeatPumpCheck(irid, tc(), rok as Year, raw);
            if (await checkRegulusOrAdmin()) return;

            const user = get(currentUser)!;
            const response = await sendEmail({
                ...defaultAddresses(),
                subject: `Vyplněna nová roční kontrola TČ k ${irName(ir.evidence.ir)}`,
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
        title: t => t.rk.formTitle({ n: `${tc()}` }),
        createWidgetData: () => {
        },
        subtitle: t => `${t.rk.year}: ${rok.toString() ?? '…'}`,
        onMount: async (d, k) => {
            if (!k.info.datum.value)
                k.info.datum.setValue(d, todayISO());
        },
    };
    return info;
})();
export default infoRK;