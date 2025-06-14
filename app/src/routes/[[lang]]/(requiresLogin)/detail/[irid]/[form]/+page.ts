import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { formInfo, type FormName } from '$lib/forms/forms.svelte';

export const load: PageLoad = async ({ params }) => {
    const formName = params.form as FormName

    if (!formInfo.keys().includes(formName)) return error(404)

    return {
        formName
    } as const
}