<script lang="ts">
    import type { PageProps } from './$types';
    import Form from '$lib/forms/Form.svelte';
    import { page } from '$app/state';

    const { data }: PageProps = $props();
    const { formInfo, editData, viewData, other, translations: t } = $derived(data);
</script>

{#key page.url}
    {#if formInfo}
        <Form {formInfo} {t} {editData} {viewData} {other} />
    {/if}
{/key}