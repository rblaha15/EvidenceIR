import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { formInfo, type FormName } from '$lib/forms/forms.svelte';
import { checkAdmin, checkRegulusOrAdmin } from '$lib/client/auth';

export const load: PageLoad = async ({ params }) => {
    const formName = params.form as FormName

    if (!formInfo.keys().includes(formName)) return error(404)

    const info = formInfo[formName]

    if (info.requiredAdmin && !await checkAdmin() || info.requiredRegulus && !await checkRegulusOrAdmin())
        return error(401);

    return {
        formName
    } as const
}