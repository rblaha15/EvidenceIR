import db from '$lib/Database';
import { invalidateAll } from '$app/navigation';
import type { IRID } from '$lib/helpers/ir';
import type { ExistingIR } from '$lib/data';
import { techniciansList } from '$lib/client/realtime';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { ensureSP } from '$lib/forms/SP/infoSP.svelte';

export const deleteSP = (i: number, irid: IRID) => async () => {
    await db.deleteSP(irid, i);
};

export const copySP = (i: number, ir: ExistingIR) => async () => {
    const ja = get(techniciansList).find(t => get(currentUser)?.email == t.email);
    const p = ensureSP(ir.SPs[i]);
    await db.addSPs(ir.meta.id!, {
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