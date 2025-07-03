import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { type FormName, forms, getForm } from '$lib/forms/forms.svelte.js';
import { checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { extractIDs, langAndFormEntryGenerator } from '../../helpers';

export const entries: EntryGenerator = langAndFormEntryGenerator;

export const load: PageLoad = async ({ params, url }) => {
    const formName = params.form as FormName;

    if (!forms.includes(formName)) return error(404);

    if (!browser) return { irid: null, spid: null, formName }

    const form = getForm(formName);

    if (form.requiredRegulus && !await checkRegulusOrAdmin())
        return error(401);

    const id = extractIDs(url);
    if (form.type == 'IR' && !id.irid)
        return error(400, { message: 'irid must be provided to access this form!' });
    return {
        formName,
        ...id,
    } as const;
};

export const prerender = true;