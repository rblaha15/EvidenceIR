import { page } from '$app/state';
import db, { type Year } from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { dayISO } from '$lib/helpers/date';
import { type DataRKT, type FormRKT } from '$lib/forms/RKT/formRKT.js';
import defaultRKT from '$lib/forms/RKT/defaultRKT';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { TC } from '$lib/forms/IN/defaultIN';
import { error } from '@sveltejs/kit';

const infoRKT = (() => {
    let defaultYear = $state() as Year;
    let filledYears = $state() as Year[];
    const pump = (url: URL = page.url) => (url.searchParams.get('pump')?.toNumber() || error(400, 'Argument pump not valid or missing')) as TC;

    const info: FormInfo<DataRKT, FormRKT, [], 'RKT'> = {
        type: 'IR',
        storeName: () => `stored_check-${pump()}`,
        defaultData: () => defaultRKT(defaultYear, filledYears),
        openPdf: () => ({
            link: 'RKT',
            pump: pump(),
        }),
        getEditData: (ir, url) => {
            const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
            if (edit) {
                defaultYear = edit
                return ir.kontrolyTC[pump(url)]![edit];
            }
        },
        getViewData: (ir, url) => {
            const checks = ir.kontrolyTC[pump(url)] ?? {};
            filledYears = checks.keys().map(y => Number(y) as Year);

            const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
            if (view) {
                defaultYear = view
                return ir.kontrolyTC[pump(url)]![view];
            }
            else {
                defaultYear = filledYears.length
                    ? (Math.max(...filledYears) + 1) as Year
                    : 1;
                if (!ir.uvedeniTC.uvadeni.date) return undefined;
                const commission = new Date(ir.uvedeniTC.uvadeni.date);
                const today = new Date(new Date().toISOString().split('T')[0]);

                const anniversaryThisYear =
                    new Date(today.getFullYear(), commission.getMonth(), commission.getDate());
                const anniversaryNextYear =
                    new Date(today.getFullYear() + 1, commission.getMonth(), commission.getDate());

                const nextAnniversary =
                    today < anniversaryThisYear ? anniversaryThisYear : anniversaryNextYear;
                const yearOfNextCheck = nextAnniversary.getFullYear() - commission.getFullYear();
                if (yearOfNextCheck in filledYears) return undefined;
                defaultYear = yearOfNextCheck as Year;
                return undefined;
            }
        },
        saveData: async (irid, raw, edit, form, editResult, t, _, ir) => {
            const hp = pump();
            await db.addHeatPumpCheck(irid, hp, form.info.year.value as Year, raw);

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
        buttons: edit => derived(isUserRegulusOrAdmin, regulus => ({
            hideSave: !edit && !regulus,
            saveAndSend: !edit && !regulus,
            saveAndSendAgain: edit && !regulus,
        })),
        title: t => t.rkt.formTitle({ n: `${pump()}` }),
        createWidgetData: () => {
        },
        onMount: async (d, k, m) => {
            if (!k.info.datum.value)
                k.info.datum.setValue(d, dayISO());
            if (m != 'create') {
                k.info.year.lock = () => true;
                k.info.year.validate = () => true;
            }
        },
    };
    return info;
})();
export default infoRKT;