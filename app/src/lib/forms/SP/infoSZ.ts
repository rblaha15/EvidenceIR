import { type ContextSZ, type FormSZ } from '$lib/forms/SP/formSZ';
import type { FormInfo } from '$lib/forms/FormInfo';
import db from '$lib/client/db';
import { error } from '@sveltejs/kit';
import { isSP } from '$lib/forms/SP/infoSP.svelte';
import defaultSZ from '$lib/forms/SP/defaultSZ';
import type { SPID, SZID } from '$lib/helpers/ir';

const infoSZ: FormInfo<ContextSZ, FormSZ> = {
    type: 'IR',
    storeName: () => 'stored_sz',
    form: () => defaultSZ(),
    getEditData: (ir, url) => {
        const editID = url.searchParams.get('edit') as SPID | SZID | null;
        if (editID) {
            const sp = ir.SPs[editID];
            if (!isSP(sp))
                return { raw: sp };
            return error(400, { message: 'Provided id is not a simple intervention' });
        }
    },
    getViewData: (ir, url) => {
        const viewID = url.searchParams.get('view') as SPID | SZID | null;
        if (viewID)
            return { raw: ir.SPs[viewID] };
    },
    saveData: async ({ irid, raw, edit }) => {
        const ir = (await db.getIR(irid))!;
        if (ir.deleted) return false

        if (edit) await db.updateSP(irid, raw);
        else await db.addSPs(irid, raw);
    },
    createContext: ({ values: v, mode }) => ({ v, edit: mode == 'edit' }),
    title: (t, mode) =>
        mode == 'edit' ? t.sz.editSZ : t.sz.title,
};

export default infoSZ;