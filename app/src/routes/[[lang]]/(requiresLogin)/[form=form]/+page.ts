import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { type FormName, forms, getForm } from '$lib/forms/forms';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { removeDependency } from '$lib/forms/dependentForm.js';
import { extractIDs, langAndFormEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langAndFormEntryGenerator;

export const load: PageLoad = async ({ params, url }) => {
    const formName = params.form as FormName;

    if (!forms.includes(formName)) return error(404);

    if (!browser) return { irid: null, spid: null, form: undefined, other: {} };

    await checkAuth()

    const form = getForm(formName);

    if (form.requiredRegulus && !await checkRegulusOrAdmin())
        return error(401);

    const id = extractIDs(url);
    if (form.type == 'IR' && !id.irid)
        return error(400, { message: 'irid must be provided to access this form!' });

    const independentForm = form.type == '' ? form : await removeDependency(form, id.irid!);


    const { raw: viewData, other: viewOther } = await independentForm.getViewData?.(url) ?? {};
    const { raw: editData, other: editOther } = await independentForm.getEditData?.(url, viewOther as Record<never, unknown>) ?? {};
    const other = { ...viewOther, ...editOther };

    return {
        ...id,
        formInfo: independentForm,
        viewData,
        editData,
        other,
    } as const;
};

export const prerender = true;