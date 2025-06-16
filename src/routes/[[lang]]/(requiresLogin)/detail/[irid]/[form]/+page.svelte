<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { type DetachedFormInfo, type FormInfo, formInfo as formInfos, type FormName } from '$lib/forms/forms.svelte';
    import type { PageProps } from './$types';
    import { getToken } from '$lib/client/auth';
    import { detailUrl } from '$lib/helpers/runes.svelte';
    import FormComponent from '$lib/forms/Form.svelte';
    import type { IRID } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/client/data';

    const { data }: PageProps = $props();
    const formName = data.formName as FormName;
    const t = data.translations;
    const irid = data.id as IRID;
    const formInfo = formInfos[formName] as FormInfo<D, F, S>;
    const {
        storeName,
        openPdf,
        saveData,
        createWidgetData,
        getEditData,
    } = formInfo;

    let ir = $state() as IR;

    const detachedFormInfo: DetachedFormInfo<D, F, S> = $derived({
        ...formInfo,
        storeName: `${storeName}_${irid}`,
        getEditData: async () => {
            const _ir = await db.getIR(irid);
            if (!_ir) return undefined;
            ir = _ir;
            return getEditData?.(ir);
        },
        saveData: async (raw, edit, data, editResult, t, send) => {
            const result = await saveData(irid, raw, edit, data, editResult, t, send, ir);
            return result != false
        },
        redirectLink: async () => detailUrl(),
        openPdf: openPdf ? () => ({
            ...openPdf(),
            data: ir,
        }) : undefined,
        createWidgetData: data => createWidgetData(ir.evidence, data),
        showBackButton: () => true,
    });
</script>

<FormComponent formInfo={detachedFormInfo} {t} />