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
import { grantPoints } from '$lib/client/loyaltyProgram';

const infoRKT: FormInfo<DataRKT, FormRKT, [], 'RKT', { defaultYear: Year, filledYears: Year[], pump: TC }> = {
    type: 'IR',
    storeName: ({ pump }) => `stored_check-${pump}`,
    defaultData: ({ defaultYear, filledYears }) => defaultRKT(defaultYear, filledYears),
    openPdf: ({ pump }) => ({
        link: 'RKT',
        pump: pump,
    }),
    getEditData: (ir, url, { pump }) => {
        const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
        if (edit) return { raw: ir.kontrolyTC[pump]![edit], other: { defaultYear: edit } };
    },
    getViewData: (ir, url) => {
        const pump = (url.searchParams.get('pump')?.toNumber() || error(400, 'Argument pump not valid or missing')) as TC;
        const checks = ir.kontrolyTC[pump] ?? {};
        const filledYears = checks.keys().map(y => Number(y) as Year);

        const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
        if (view) return { raw: ir.kontrolyTC[pump]![view], other: { defaultYear: view, filledYears, pump } };
        else {
            const defaultYear = filledYears.length
                ? (Math.max(...filledYears) + 1) as Year
                : 1;
            if (!ir.uvedeniTC.uvadeni.date) return { other: { defaultYear, filledYears, pump } };
            const commission = new Date(ir.uvedeniTC.uvadeni.date);
            const today = new Date(new Date().toISOString().split('T')[0]);

            const anniversaryThisYear =
                new Date(today.getFullYear(), commission.getMonth(), commission.getDate());
            const anniversaryNextYear =
                new Date(today.getFullYear() + 1, commission.getMonth(), commission.getDate());

            const nextAnniversary =
                today < anniversaryThisYear ? anniversaryThisYear : anniversaryNextYear;
            const yearOfNextCheck = nextAnniversary.getFullYear() - commission.getFullYear();
            if (yearOfNextCheck in filledYears) return { other: { defaultYear, filledYears, pump } };
            return { other: { defaultYear: yearOfNextCheck as Year, filledYears, pump } };
        }
    },
    saveData: async (irid, raw, edit, form, editResult, t, _, ir, { pump }) => {
        const year = form.info.year.value as Year;
        await db.addHeatPumpCheck(irid, pump, year, raw);

        await grantPoints({ type: 'heatPumpYearlyCheck', irid, pump, year });

        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Vyplněna nová roční kontrola TČ${pump} k ${irName(ir.evidence.ir)}`
                : `Upravena roční kontrola TČ${pump} k ${irName(ir.evidence.ir)}`,
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
        hideSave: !regulus,
        saveAndSend: !edit && !regulus,
        saveAndSendAgain: edit && !regulus,
    })),
    title: (t, _, { pump }) => t.rkt.formTitle({ n: `${pump}` }),
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

export default infoRKT;