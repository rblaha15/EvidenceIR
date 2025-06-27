<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { type DetachedFormInfo, type FormInfo, formInfo as formInfos, type FormName } from '$lib/forms/forms.svelte';
    import type { PageProps } from './$types';
    import { getToken } from '$lib/client/auth';
    import { detailUrl } from '$lib/helpers/runes.svelte';
    import { evidence as getEvidence, type IR, type IRID } from '$lib/client/firestore';
    import FormComponent from '$lib/forms/Form.svelte';

    const { data }: PageProps = $props();
    const formName = data.formName as FormName;
    const t = data.translations;
    const irid = data.irid_spid as IRID;
    const formInfo = formInfos[formName] as FormInfo<D, F, S>;
    const {
        storeName,
        pdfLink,
        saveData,
        createWidgetData,
        getEditData,
        onMount,
    } = formInfo;

    let ir = $state() as IR;

    const detachedFormInfo: DetachedFormInfo<D, F, S> = $derived({
        ...formInfo,
        storeName: `${storeName}_${irid}`,
        getEditData: async () => {
            const snapshot = await getEvidence(irid);
            if (snapshot.exists()) {
                ir = snapshot.data();
                return getEditData?.(ir);
            } else return undefined;
        },
        saveData: async (raw, edit, data, editResult, t, send) => {
            const result = await saveData(irid, raw, edit, data, editResult, t, send, ir);
            return result != false
        },
        redirectLink: async () => detailUrl(),
        openTabLink: async () => detailUrl(`/pdf/${pdfLink()}?token=${await getToken()}`),
        createWidgetData: data => createWidgetData(ir.evidence, data),
        showBackButton: () => true,
        onMount: (d, f, e) => onMount?.(d, f, e, ir),
    });
</script>

<FormComponent formInfo={detachedFormInfo} {t} />