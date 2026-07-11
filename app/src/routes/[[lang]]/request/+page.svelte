<script lang="ts">
    import { call } from '$lib/client/db/endpoints';
    import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { Spinner } from '$lib/components/ui/spinner';
    import { setTitle } from '$lib/helpers/globals';
    import { Check, OctagonAlert } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    const { data }: {
        data: PageData & {
            code: string,
            user: string,
            location: string,
            company: string,
        }
    } = $props();

    const t = $derived(data.translations.dk.requestPage);

    let status = $state<'loading' | 'accepted' | 'error'>('loading');

    onMount(async () => {
        setTitle(t.title, false, true);

        try {
            await call('db/open/sendRequest', { code: data.code });
            status = 'accepted';
        } catch (e) {
            status = 'error';
        }
    });
</script>

{#if status === 'loading'}
    <Alert>
        <Spinner/>
        <AlertTitle>{t.sending}</AlertTitle>
    </Alert>
{:else if status === 'accepted'}
    <Alert variant="success">
        <Check/>
        <AlertTitle>{t.requestSent}</AlertTitle>
        <AlertDescription>{t.youCanCloseThisTab}</AlertDescription>
    </Alert>
{/if}
{#if status === 'error'}
    <Alert variant="danger">
        <OctagonAlert/>
        <AlertTitle>{t.somethingWentWrong}</AlertTitle>
        <AlertDescription>{@html t.unknownErrorHtml}</AlertDescription>
    </Alert>
{/if}
