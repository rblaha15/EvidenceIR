<script lang="ts">
    import { call } from '$lib/client/endpoints';
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import SpinnerAlert from '$lib/components/alerts/SpinnerAlert.svelte';
    import SuccessAlert from '$lib/components/alerts/SuccessAlert.svelte';
    import type { RecommendationData } from '$lib/data';
    import { setTitle } from '$lib/helpers/globals';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    const { data }: {
        data: PageData & {
            code: string
        } & RecommendationData;
    } = $props();

    const t = $derived(data.translations.dk.requestPage);

    let status = $state<'loading' | 'accepted' | 'error'>('loading');

    $effect(() => {
        if (data.resolved) status = data.resolved.reason == 'requested' ? 'accepted' : 'error';
    });

    onMount(async () => {
        setTitle(t.title, false, true);

        if (status !== 'loading') return;
        try {
            await call('db/open/sendRequest', { code: data.code });
            status = 'accepted';
        } catch (e) {
            status = 'error';
        }
    });
</script>

{#if status === 'loading'}
    <SpinnerAlert title={t.sending} />
{:else if status === 'accepted'}
    <SuccessAlert title={t.requestSent} description={t.youCanCloseThisTab} />
{/if}
{#if status === 'error'}
    <DangerAlert title={t.somethingWentWrong}>{@html t.unknownErrorHtml}</DangerAlert>
{/if}
