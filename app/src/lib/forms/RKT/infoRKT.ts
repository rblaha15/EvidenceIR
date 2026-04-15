import { page } from '$app/state';
import { type IR, type Year } from '$lib/data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { type ContextRKT, type FormRKT } from '$lib/forms/RKT/formRKT.js';
import defaultRKT from '$lib/forms/RKT/defaultRKT';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { TC } from '$lib/forms/IN/defaultIN';
import { error } from '@sveltejs/kit';
import { grantPoints } from '$lib/client/loyaltyProgram';
import type { Raw, Values } from '$lib/forms/Form';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';
import db from '$lib/Database';
import type { Translations } from '$lib/translations';

export const isRKTL = (raw: Raw<FormRKT | FormRKTL> | undefined): raw is Raw<FormRKTL> => !!raw && !('funkcniTest' in raw)

export const hasRKTL = (data: { [_ in Year]?: Raw<FormRKT | FormRKTL> } | undefined) =>
    Boolean(data && data.getValues().some(isRKTL))

const getDataFromLastYear = (ir: IR, pump: TC, filledYears: Year[]) => {
    const lastYear = ir.RK.TC?.[pump]?.[Math.max(...filledYears)];
    if (!lastYear) return undefined;

    const keys = [
        'celkoveProvozniHodinyKompresoru',
        'provozniHodinyKompresoruDoTepleVody',
        'celkovyPocetStartuKompresoru',
        'pocetStartuKompresoruDoTepleVody',
        'celkoveProvozniHodinyDoplnkovehoZdroje',
        'celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody',
    ] satisfies (keyof Values<FormRKT>['kontrolaRegulace'])[];

    const values = !isRKTL(lastYear) ? [
        lastYear.kontrolaRegulace.celkoveProvozniHodinyKompresoru,
        lastYear.kontrolaRegulace.provozniHodinyKompresoruDoTepleVody,
        lastYear.kontrolaRegulace.celkovyPocetStartuKompresoru,
        lastYear.kontrolaRegulace.pocetStartuKompresoruDoTepleVody,
        lastYear.kontrolaRegulace.celkoveProvozniHodinyDoplnkovehoZdroje,
        lastYear.kontrolaRegulace.celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody,
    ] : [
        lastYear.kontrolniUkonyRegulace.stavPocitadlaCelkovychProvoznichHodinKompresoru,
        lastYear.kontrolniUkonyRegulace.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace,
        lastYear.kontrolniUkonyRegulace.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace,
        lastYear.kontrolniUkonyRegulace.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace,
        lastYear.kontrolniUkonyRegulace.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje,
        lastYear.kontrolniUkonyRegulace.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv,
    ];

    return keys.zip(values).toRecord().mapValues((_, value) =>
        (t: Translations) => t.rkt.valueFromLastCheck([value])
    );
};

const infoRKT: FormInfo<ContextRKT, FormRKT, [], 'RKT' | 'RKTL', { defaultYear: Year, filledYears: Year[], pump: TC, hasLegacy: boolean }> = {
    type: 'IR',
    storeName: ({ pump }) => `stored_check-${pump}`,
    form: ({ defaultYear, filledYears }) => defaultRKT(defaultYear, filledYears),
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
    saveData: async ({ irid, raw, edit, values, editResult, t, ir, other: { pump } }) => {
        const year = values.info.year as Year;
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
    createContext: ({ IN, mode, ir, other: { pump, filledYears } }) =>
        ({ IN, mode, dataFromLastYear: getDataFromLastYear(ir, pump, filledYears) }),
    onMount: async ({ mode, values, ir, other: { pump, filledYears } }) => {
        if (mode == 'create') {
            const lastYear = ir.RK.TC?.[pump]?.[Math.max(...filledYears)];
            if (lastYear && !isRKTL(lastYear))
                values.kontrolaOtopneSoustavy.kontrolaPojistovacichVentiluPoznamka = lastYear.kontrolaOtopneSoustavy.kontrolaPojistovacichVentiluPoznamka || '';
        }
        if (ir.UP.TC) {
            values.kontrolaTlakuExpanznichNadob.expanzniNadobaOtopneSoustavyPriUPT = ir.UP.TC.os.tlakEnOs || '';
            values.kontrolaTlakuExpanznichNadob.expanzniNadobaPitneVodyPriUPT = ir.UP.TC.os.tlakEnTv || '';
            values.kontrolaOtopneSoustavy.kontrolaTlakuVOtopneSoustavePriUPT = ir.UP.TC.os.tlakOs || '';
        }
    },
};

export default infoRKT;