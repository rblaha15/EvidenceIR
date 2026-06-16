import db from '$lib/client/db';
import { invalidateAll } from '$app/navigation';
import type { IRID, SPID } from '$lib/helpers/ir';
import type { ExistingIR } from '$lib/data';
import { techniciansList } from '$lib/client/realtime';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { ensureSP } from '$lib/forms/SP/infoSP.svelte';

export const deleteSP = db.deleteSP;

export const copySP = async (id: SPID, ir: ExistingIR) => {
    const ja = get(techniciansList).find(t => get(currentUser)?.email == t.email);
    const p = ensureSP(ir.SPs[id]);
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