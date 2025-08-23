<script lang="ts">
    import type { PageProps } from './$types';
    import Form from '$lib/forms/Form.svelte';
    import { page } from '$app/state';

    const { data }: PageProps = $props();
    const { formInfo, editData, viewData, translations: t } = $derived(data);
</script>

{#key page.url}
    {#if page.url.searchParams.has('sent')}
        <div class="alert alert-success" role="alert">
            {t.form.successfullySent}
        </div>
    {/if}

    {#if formInfo}
        <Form {formInfo} {t} {editData} {viewData} />
    {/if}
{/key}