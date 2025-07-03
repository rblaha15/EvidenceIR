<script generics="
    N extends FormName,
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf = Pdf,
" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    // noinspection ES6UnusedImports
    import type { Pdf } from '$lib/client/pdf';
    // noinspection ES6UnusedImports
    import { type FormInfo, type FormName, getForm, type IndependentFormInfo } from '$lib/forms/forms.svelte.js';
    import type { PageProps } from './$types';
    import FormComponent from '$lib/forms/Form.svelte';
    import { removeDependency } from './dependentForm.svelte';

    const { data }: PageProps = $props();
    const formName = $derived(data.formName as N);
    const t = data.translations;
    const irid = data.irid;
    const formInfo = $derived(getForm<N, D, F, S, P>(formName));

    const independentFormInfo: IndependentFormInfo<D, F, S, P> = $derived(
        formInfo.type == ''
            ? formInfo
            : removeDependency(formInfo as FormInfo<D, F, S>, irid!),
    ) as IndependentFormInfo<D, F, S, P>;
</script>
{#key formName + irid}
    <FormComponent formInfo={independentFormInfo} {t} />
{/key}