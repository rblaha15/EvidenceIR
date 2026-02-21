import db from '$lib/Database';
import { goto, invalidateAll } from '$app/navigation';
import { iridUrl } from '$lib/helpers/runes.svelte.js';
import { xmlIN } from '$lib/forms/IN/xmlIN';
import { rawDataToData } from '$lib/forms/Form';
import defaultIN from '$lib/forms/IN/defaultIN';
import { getTranslations } from '$lib/translations';
import { createFileUrl, downloadFile } from '$lib/helpers/files';
import type { IRID } from '$lib/helpers/ir';
import type { ExistingIR } from '$lib/data';
import { techniciansList } from '$lib/client/realtime';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';

export const deleteSP = (i: number, irid: IRID) => async () => {
    await db.deleteSP(irid, i);
};

export const copySP = (i: number, ir: ExistingIR) => async () => {
    const ja = get(techniciansList).find(t => get(currentUser)?.email == t.email);
    const p = ir.SPs[i];
    await db.addSP(ir.meta.id!, {
        ...p,
        fakturace: {
            hotove: 'doNotInvoice',
            komu: { chosen: null, text: '' },
            jak: null,
            invoiceParts: [],
            discount: '',
            discountReason: '',
        },
        zasah: {
            ...p.zasah,
            clovek: ja?.name ?? p.zasah.clovek,
            inicialy: ja?.initials ?? p.zasah.inicialy,
        },
    });
    await invalidateAll();
};