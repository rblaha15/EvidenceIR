<script lang="ts">
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals';
    import type { LayoutData } from './$types';

    const { data }: { data: LayoutData } = $props();
    const t = $derived(data.translations);

    $effect(() => setTitle(t.auth.somethingWentWrong, true));
</script>

<h3>
    Error {page.status}:
    {#if page.status === 404}
        {t.auth.siteDoesNotExist}
    {:else if page.status === 401}
        {t.auth.noAccess}
    {:else}
        {page.error?.message}
    {/if}
</h3>