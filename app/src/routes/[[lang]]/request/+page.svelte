<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';

    const { data }: {
        data: PageData & {
            code: string,
            user: string,
            location: string,
            company: string,
        }
    } = $props();

    const t = $derived(data.translations.rk.recommendations.requestPage);

    let status = $state<'loading' | 'accepted' | 'error'>('loading');

    onMount(async () => {
        status = 'loading';
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
    <div class="alert alert-secondary d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        <p class="m-0">{t.sending}</p>
    </div>
{:else if status === 'accepted'}
    <div class="alert alert-success d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
            <Icon icon="done" />
            <h4 class="alert-heading m-0">{t.requestSent}</h4>
        </div>
        <p class="m-0">{t.youCanCloseThisTab}</p>
    </div>
{/if}
{#if status === 'error'}
    <div class="alert alert-danger d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
            <Icon icon="error_outline" />
            <h4 class="alert-heading m-0">{t.somethingWentWrong}</h4>
        </div>
        <p class="m-0">{@html t.unknownErrorHtml}</p>
    </div>
{/if}
