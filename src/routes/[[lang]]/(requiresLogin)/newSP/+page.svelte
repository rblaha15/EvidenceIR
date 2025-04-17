<script lang="ts">
    import type { PageProps } from './$types';
    import FormComponent from '$lib/forms/Form.svelte';
    import sp2 from '$lib/forms/SP2';

    const { data }: PageProps = $props();
    const t = data.translations;
</script>

<FormComponent formInfo={sp2} {t}></FormComponent>