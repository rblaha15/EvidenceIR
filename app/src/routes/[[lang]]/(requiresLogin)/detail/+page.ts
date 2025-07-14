import type { EntryGenerator, PageLoad } from './$types';
import { extractIDs, langEntryGenerator } from '../../helpers';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';
import { startTechniciansListening } from '$lib/client/realtime';
import db, { type IR } from '$lib/client/data';
import type { IRID, SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }): Promise<{
    irid: IRID | null, spid: SPID | null,
    ir: IR | undefined, sp: Raw<FormNSP> | undefined,
    success: boolean,
}> => {
    if (!browser) return { irid: null, spid: null, success: false, ir: undefined, sp: undefined };
    const id = extractIDs(url);
    if (!id.irid && !id.spid) error(400, { message: 'At least one of irid or spid bust be provided!' });

    await checkAuth();
    await startTechniciansListening();

    const base = { ...id, ir: undefined, sp: undefined, success: false }

    try {
        if (id.irid) {
            const ir = await db.getIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir, success: true };
        } else if (id.spid) {
            let sp = await db.getIndependentProtocol(id.spid);

            if (!sp) {
                id.spid = id.spid.split('-').slice(0, -1).join('-') as SPID;
                sp = await db.getIndependentProtocol(id.spid);
            }

            if (!sp) return { ...base };
            return { ...base, sp, success: true };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const prerender = true;