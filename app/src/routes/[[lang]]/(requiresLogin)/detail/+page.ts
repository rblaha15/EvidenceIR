import type { EntryGenerator, PageLoad } from './$types';
import { extractIDs, getDataAsStore, langEntryGenerator } from '../../helpers';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';
import { startTechniciansListening } from '$lib/client/realtime';
import { derived, type Readable, readable } from 'svelte/store';
import { waitUntil } from '$lib/helpers/stores';
import type { IRID, SPID } from '$lib/helpers/ir';
import type { IR } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, spids: [], ir: undefined, sps: readable([]) };
    const id = extractIDs(url);
    if (!id.irid && !id.spids) error(400, { message: 'At least one of irid or spid bust be provided!' });

    await checkAuth();
    await startTechniciansListening();

    const data = getDataAsStore(id);

    await waitUntil(data.ir, p => p != 'loading')
    await waitUntil(data.sps, p => p != 'loading')

    return {
        ...data,
        sps: derived(data.sps, (s, set) => { if (s != 'loading') set(s) }),
        ir: derived(data.ir, (i, set) => { if (i != 'loading') set(i) }),
    } as {
        irid: IRID | null, spids: SPID[],
        ir: Readable<IR | undefined>, sps: Readable<Raw<FormNSP>[]>,
    };
};

export const prerender = true;