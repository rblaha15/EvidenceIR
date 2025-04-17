<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form, Raw } from '$lib/forms/Form';
    import { type DetachedFormInfo, type FormInfo, formInfo as formInfos, type FormName } from '$lib/forms/forms.svelte';
    import type { PageProps } from './$types';
    import type { Data } from '$lib/forms/Data';
    import { getToken } from '$lib/client/auth';
    import { detailUrl } from '$lib/helpers/runes.svelte';
    import { evidence as getEvidence } from '$lib/client/firestore';
    import FormComponent from '$lib/forms/Form.svelte';

    const { data }: PageProps = $props();
    const formName = data.formName as FormName;
    const t = data.translations;
    const irid = data.irid;
    const formInfo = formInfos[formName] as FormInfo<D, F, S>;
    const {
        storeName,
        pdfLink,
        saveData,
        createWidgetData,
        getEditData,
    } = formInfo;

    let evidence = $state() as Raw<Data>;

    const detachedFormInfo: DetachedFormInfo<D, F, S> = $derived({
        ...formInfo,
        storeName: `${storeName}_${irid}`,
        getEditData: async () => {
            const snapshot = await getEvidence(irid);
            if (snapshot.exists()) {
                const ir = snapshot.data();
                evidence = ir.evidence;
                return getEditData?.(ir);
            } else return undefined;
        },
        saveData: async (raw, edit, data) => {
            await saveData(irid, raw, edit, data);
            return true
        },
        redirectLink: async () => detailUrl(),
        openTabLink: async () => detailUrl(`/pdf/${pdfLink()}?token=${await getToken()}`),
        createWidgetData: data => createWidgetData(evidence, data),
    });
</script>

<FormComponent formInfo={detachedFormInfo} {t} />