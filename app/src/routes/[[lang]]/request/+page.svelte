<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { Check, OctagonAlert } from "@lucide/svelte";
    import { setTitle } from "$lib/helpers/globals";
    import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
    import { Spinner } from "$lib/components/ui/spinner";

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

        const response = await fetch(`/api/recommend-rk`, {
            method: 'POST',
            body: JSON.stringify({ code: data.code, action: 'sendRequest' }),
            headers: {
                'content-type': 'application/json',
            },
        });
        if (response.ok)
            status = 'accepted';
        else
            status = 'error';
    });
</script>

{#if status === 'loading'}
    <Alert>
        <Spinner />
        <AlertTitle>{t.sending}</AlertTitle>
    </Alert>
{:else if status === 'accepted'}
    <Alert>
        <Check />
        <AlertTitle>{t.requestSent}</AlertTitle>
        <AlertDescription>{t.youCanCloseThisTab}</AlertDescription>
    </Alert>
{/if}
{#if status === 'error'}
    <Alert variant="destructive">
        <OctagonAlert />
        <AlertTitle>{t.somethingWentWrong}</AlertTitle>
        <AlertDescription>{@html t.unknownErrorHtml}</AlertDescription>
    </Alert>
{/if}
