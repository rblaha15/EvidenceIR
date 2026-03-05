import { nowISO } from '$lib/helpers/date';
import { type DataSZ, type FormSZ } from '$lib/forms/SP/formSZ';
import type { FormInfo } from '$lib/forms/FormInfo';
import db from '$lib/Database';
import { error } from '@sveltejs/kit';
import { isSP } from '$lib/forms/SP/infoSP.svelte';
import defaultSZ from '$lib/forms/SP/defaultSZ';

const infoSZ: FormInfo<DataSZ, FormSZ, [], never, { i: number }> = {
    type: 'IR',
    storeName: () => 'stored_sz',
    defaultData: () => defaultSZ(),
    getEditData: (ir, url) => {
        const editIndex = url.searchParams.get('edit') as string | null;
        if (editIndex) {
            const i = Number(editIndex);
            const sp = ir.SPs[i];
            if (!isSP(sp))
                return { raw: sp, other: { i } };
            return error(400, { message: 'Provided index is not a simple intervention' });
        }
    },
    getViewData: (ir, url) => {
        const viewIndex = url.searchParams.get('view') as string | null;
        if (viewIndex) {
            const i = Number(viewIndex);
            return { raw: ir.SPs[i], other: { i } };
        } else {
            return { other: { i: ir.SPs.length } };
        }
    },
    saveData: async (irid, raw, edit, _1, _2, _3, _4, _5, { i }) => {
        const ir = (await db.getIR(irid))!;
        if (ir.deleted) return false

        if (edit) await db.updateSP(irid, i, raw);
        else await db.addSP(irid, raw);
    },
    createWidgetData: (_, p) => p,
    title: (t, mode) =>
        mode == 'edit' ? t.sz.editSZ : t.sz.title,
    onMount: async (d, p) => {
        if (!p.zasah.datum.value) // Also in SP, NSP
            p.zasah.datum.setValue(d, nowISO());
    },
};

export default infoSZ;