import { type Year } from '$lib/data';
import type { FormInfo } from '$lib/forms/FormInfo';
import type { TC } from '$lib/forms/IN/defaultIN';
import { error } from '@sveltejs/kit';
import type { DataRKTL, FormRKTL } from '$lib/forms/RKT/formRKTL';
import defaultRKTL from '$lib/forms/RKT/defaultRKTL';
import type { Raw } from '$lib/forms/Form';
import db from '$lib/Database';

const infoRKT: FormInfo<DataRKTL, FormRKTL, [], 'RKTL', { defaultYear: Year, filledYears: Year[], pump: TC }> = {
    type: 'IR',
    storeName: ({ pump }) => `stored_check-${pump}`,
    defaultData: ({ defaultYear, filledYears }) => defaultRKTL(defaultYear, filledYears),
    openPdf: ({ pump }) => ({
        link: 'RKTL',
        pump: pump,
    }),
    getEditData: (ir, url, { pump }) => {
        const edit = (url.searchParams.get('edit-year')?.toNumber()) as Year | undefined;
        if (edit) return { raw: ir.RK.TC[pump]![edit] as Raw<FormRKTL>, other: { defaultYear: edit } };
    },
    getViewData: (ir, url) => {
        const pump = (url.searchParams.get('pump')?.toNumber() || error(400, 'Argument pump not valid or missing')) as TC;
        const checks = ir.RK.TC[pump] ?? {};
        const filledYears = checks.keys().map(y => Number(y) as Year);

        const view = (url.searchParams.get('view-year')?.toNumber()) as Year | undefined;
        if (view) return { raw: ir.RK.TC[pump]![view] as Raw<FormRKTL>, other: { defaultYear: view, filledYears, pump } };
    },
    saveData: async (irid, raw, _1, form, _2, _3, _4, _5, { pump }) => {
        const year = form.info.year.value as Year;
        await db.addHeatPumpCheck(irid, pump, year, raw);
    },
    title: (t, _, { pump }) => t.rkt.formTitle({ n: `${pump}` }),
    createWidgetData: () => {
    },
    onMount: async (_, k) => {
        k.info.year.lock = () => true;
        k.info.year.validate = () => true;
    },
};

export default infoRKT;