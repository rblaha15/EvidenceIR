<script lang="ts">
    import { page } from '$app/state';
    import { hideNav, setTitle } from '$lib/helpers/globals';
    import type { LayoutData } from './$types';
    import { getReasonPhrase } from 'http-status-codes';

    const { data }: { data: LayoutData } = $props();
    const t = $derived(data.translations);

    $effect(() => setTitle(t.auth.somethingWentWrong, true, $hideNav));
</script>

<h3>
    Error {page.status} ({getReasonPhrase(page.status)}):
    {#if page.status === 404}
        {t.auth.siteDoesNotExist}
    {:else if page.status === 401}
        {t.auth.noAccess}
    {:else}
        {page.error?.message}
    {/if}
</h3>