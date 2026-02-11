import { page } from '$app/state';
import { type Year } from '$lib/data';
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
import type { Raw } from '$lib/forms/Form';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';
import db from '$lib/Database';

export const isRKTL = (raw: Raw<FormRKT | FormRKTL> | undefined): raw is Raw<FormRKTL> => !!raw && !('funkcniTest' in raw)

export const hasRKTL = (data: { [_ in Year]?: Raw<FormRKT | FormRKTL> } | undefined) =>
    Boolean(data && data.getValues().some(isRKTL))

const infoRKT: FormInfo<DataRKT, FormRKT, [], 'RKT' | 'RKTL', { defaultYear: Year, filledYears: Year[], pump: TC, hasLegacy: boolean }> = {
    type: 'IR',
    storeName: ({ pump }) => `stored_check-${pump}`,
    defaultData: ({ defaultYear, filledYears }) => defaultRKT(defaultYear, filledYears),
    openPdf: ({ pump, hasLegacy }) => ({
        link: hasLegacy ? 'RKTL' : 'RKT',
        pump: pump,
    }),
    getEditData: (ir, url, { pump }) => {
        const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
        if (edit) return { raw: ir.RK.TC[pump]![edit] as Raw<FormRKT>, other: { defaultYear: edit } };
    },
    getViewData: (ir, url) => {
        const pump = (url.searchParams.get('pump')?.toNumber() || error(400, 'Argument pump not valid or missing')) as TC;
        const checks = ir.RK.TC[pump] ?? {};
        const filledYears = checks.keys().map(y => Number(y) as Year);
        const hasLegacy = hasRKTL(checks);

        const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
        if (view) return { raw: ir.RK.TC[pump]![view] as Raw<FormRKT>, other: { defaultYear: view, filledYears, pump, hasLegacy } };
        else {
            const defaultYear = filledYears.length
                ? (Math.max(...filledYears) + 1) as Year
                : 1;
            if (!ir.UP.dateTC) return { other: { defaultYear, filledYears, pump, hasLegacy } };
            const commission = new Date(ir.UP.dateTC);
            const today = new Date(new Date().toISOString().split('T')[0]);

            const anniversaryThisYear =
                new Date(today.getFullYear(), commission.getMonth(), commission.getDate());
            const anniversaryNextYear =
                new Date(today.getFullYear() + 1, commission.getMonth(), commission.getDate());

            const nextAnniversary =
                today < anniversaryThisYear ? anniversaryThisYear : anniversaryNextYear;
            const yearOfNextCheck = nextAnniversary.getFullYear() - commission.getFullYear();
            if (yearOfNextCheck in filledYears) return { other: { defaultYear, filledYears, pump, hasLegacy } };
            return { other: { defaultYear: yearOfNextCheck as Year, filledYears, pump, hasLegacy } };
        }
    },
    saveData: async (irid, raw, edit, form, editResult, t, _, ir, { pump }) => {
        const year = form.info.year.value as Year;
        await db.addRKT(irid, pump, year, raw);

        await grantPoints({ type: 'heatPumpYearlyCheck', irid, pump, year });

        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Vyplněna nová roční kontrola TČ${pump} k ${irName(ir.IN.ir)}`
                : `Upravena roční kontrola TČ${pump} k ${irName(ir.IN.ir)}`,
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
    title: (t, _, { pump }) => t.rkt.formTitle({ n: `${pump}` }),
    createWidgetData: e => e,
    onMount: async (d, k, m, ir, { pump, filledYears }) => {
        if (!k.info.datum.value)
            k.info.datum.setValue(d, dayISO());
        if (m != 'create') {
            k.info.year.lock = () => true;
            k.info.year.validate = () => true;
        } else {
            const lastYear = ir.RK.TC?.[pump]?.[Math.max(...filledYears)];
            if (lastYear && !isRKTL(lastYear))
                k.kontrolaOtopneSoustavy.kontrolaPojistovacichVentiluPoznamka.setValue(d, lastYear.kontrolaOtopneSoustavy.kontrolaPojistovacichVentiluPoznamka || '');
        }
        if (ir.UP.TC) {
            k.kontrolaTlakuExpanznichNadob.expanzniNadobaOtopneSoustavyPriUPT.setValue(d, ir.UP.TC.os.tlakEnOs || '');
            k.kontrolaTlakuExpanznichNadob.expanzniNadobaPitneVodyPriUPT.setValue(d, ir.UP.TC.os.tlakEnTv || '');
            k.kontrolaOtopneSoustavy.kontrolaTlakuVOtopneSoustavePriUPT.setValue(d, ir.UP.TC.os.tlakOs || '');
        }
    },
};

export default infoRKT;