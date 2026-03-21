import { page } from '$app/state';
import { type Year } from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import defaultRKS from '$lib/forms/RKS/defaultRKS';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { ContextRKS, FormRKS } from '$lib/forms/RKS/formRKS';
import db from '$lib/Database';

const infoRKS: FormInfo<ContextRKS, FormRKS, [], 'RKS', { defaultYear: Year, filledYears: Year[] }> = {
    type: 'IR',
    storeName: () => `stored_check`,
    form: ({ defaultYear, filledYears }) => defaultRKS(defaultYear, filledYears),
    openPdf: () => ({
        link: 'RKS',
    }),
    getEditData: (ir, url) => {
        const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
        if (edit) return { raw: ir.RK.SOL![edit], other: { defaultYear: edit } };
    },
    getViewData: (ir, url) => {
        const checks = ir.RK.SOL ?? {};
        const filledYears = checks.keys().map(y => Number(y) as Year);

        const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
        if (view) return { raw: ir.RK.SOL![view], other: { defaultYear: view, filledYears } };
        else {
            const defaultYear = filledYears.length
                ? (Math.max(...filledYears) + 1) as Year
                : 1;
            if (!ir.UP.dateSOL) return { other: { defaultYear, filledYears } };
            const commission = new Date(ir.UP.dateSOL);
            const today = new Date(new Date().toISOString().split('T')[0]);

            const anniversaryThisYear =
                new Date(today.getFullYear(), commission.getMonth(), commission.getDate());
            const anniversaryNextYear =
                new Date(today.getFullYear() + 1, commission.getMonth(), commission.getDate());

            const nextAnniversary =
                today < anniversaryThisYear ? anniversaryThisYear : anniversaryNextYear;
            const yearOfNextCheck = nextAnniversary.getFullYear() - commission.getFullYear();
            if (yearOfNextCheck in filledYears) return { other: { defaultYear, filledYears } };
            return { other: { defaultYear: yearOfNextCheck as Year, filledYears } };
        }
    },
    saveData: async ({ irid, values, raw, edit, editResult, t, ir }) => {
        await db.addRKS(irid, values.info.year as Year, raw);

        if (await checkRegulusOrAdmin()) return;

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Vyplněna nová roční kontrola SOL k ${irName(ir.IN.ir)}`
                : `Upravena roční kontrola SOL k ${irName(ir.IN.ir)}`,
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
    title: t => t.rks.formTitle,
    createContext: ({ mode }) => ({ mode }),
};

export default infoRKS;