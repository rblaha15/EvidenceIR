import { type User, user } from '$lib/client/auth';
import db from '$lib/client/db';
import type { Raw } from '$lib/forms/Form';
import type { FormInfo } from '$lib/forms/FormInfo';
import defaultSZ from '$lib/forms/SP/defaultSZ';
import { type ContextSZ, type FormSZ } from '$lib/forms/SP/formSZ';
import { extractIDFromSPOrSZ, isSP, isSZ, type SPID, type SZID } from '$lib/helpers/ir';
import { error } from '@sveltejs/kit';

const infoSZ: FormInfo<ContextSZ, FormSZ, [[User | null]], 'SP', { isBaseSZ?: boolean }> = {
    type: 'IR',
    storeName: () => 'stored_sz',
    form: () => defaultSZ(),
    openPdf: raw => ({
        link: 'SP',
        id: extractIDFromSPOrSZ(raw),
    }),
    getEditData: (ir, url) => {
        const editID = url.searchParams.get('edit') as SPID | SZID | null;
        if (editID) {
            const sp = ir.SPs[editID];
            if (!isSP(sp) && isSZ(sp))
                return { raw: sp };
            return error(400, { message: 'Provided id is not a simple intervention' });
        }
    },
    getViewData: (ir, url) => {
        const viewID = url.searchParams.get('view') as SPID | SZID | null;
        if (viewID) {
            const sp = ir.SPs[viewID];
            return { raw: sp as Raw<FormSZ>, other: { isBaseSZ: !isSZ(sp) } };
        }
    },
    saveData: async ({ irid, raw, edit }) => {
        const ir = (await db.getIR(irid))!;
        if (ir.deleted) return false;

        if (edit) await db.updateSP(irid, raw);
        else await db.addSPs(irid, [raw]);
    },
    storeEffects: [
        [([$user], { values, mode }) => { // Also in SP, NSP
            if (mode != 'create') return;
            if (!values.zasah.clovek) values.zasah.clovek = $user?.name ?? '';
            if (!values.zasah.userEmail) values.zasah.userEmail = $user?.email ?? '';
        }, [user]],
    ],
    createContext: ({ values: v, mode, other: { isBaseSZ } }) => ({ v, edit: mode == 'edit', isBaseSZ }),
    title: (t, mode) =>
        mode == 'edit' ? t.sz.editSZ : t.sz.title,
};

export default infoSZ;