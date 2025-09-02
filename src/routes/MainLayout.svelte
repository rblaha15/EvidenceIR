<script lang="ts">
    import type { LayoutData } from './$types';
    import { checkAuth } from '$lib/client/auth';
    import Navigation from '$lib/components/nav/Navigation.svelte';
    import { onMount, type Snippet } from 'svelte';
    import { backButton, endLoading, initialRoute, progress, startLoading, title } from '$lib/helpers/globals';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { preferredLanguage } from '$lib/languages';
    import { relUrl } from '$lib/helpers/runes.svelte';

    interface Props {
        data: LayoutData;
        children?: Snippet;
    }

    let { children, data }: Props = $props();

    const t = $derived(data.translations);

    onMount(async () => {
        beforeNavigate(() => {
            startLoading();
        });
        afterNavigate(() => {
            endLoading();
        });
    });

    const processGoto = async (url: URL) => {
        const link = url.searchParams.get('goto');
        if (!link) return;
        url.searchParams.delete('goto');
        await goto(url, { replaceState: true });
        await goto(link);
    };

    $effect(() => {
        processGoto(page.url);
    });

    onMount(async () => {
    });
    onMount(async () => {
        const currentLangLength = data.languageCode?.length ?? -1;
        const path = page.url.pathname.slice(currentLangLength + 1);
        if (path == '') await goto(relUrl(initialRoute));
        if (!data.isLanguageFromUrl) await goto(
            '/' +
            preferredLanguage() +
            path +
            page.url.search +
            page.url.hash,
            { replaceState: true, invalidateAll: true },
        );
    });
</script>

<svelte:head>
    <title>{dev ? '(dev) ' : ''}SEIR :: {$title}</title>
</svelte:head>

{#await checkAuth()}
    <div class="spinner-border text-danger m-2"></div>
{:then _}
    <div class="d-flex flex-column h-100">
        <Navigation {t} />
        <div class="flex-grow-1 mb-2 overflow-y-scroll">
            <div class="sticky-top progress rounded-0" role="progressbar"
                 style:scale="1 {$progress === 'load' ? 1 : 0}"
                 style="transition: scale .5s; transform-origin: top;"
            >
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger rounded-0"
                     style:width="{$progress === 'load' ? 90 : $progress === 'done' ? 100 : 0}%"
                     style="transition: width 5s;"
                ></div>
            </div>
            <div class="container mt-2 d-flex flex-column gap-3">
                <h1 class="m-0 d-flex align-items-center gap-3">
                    {#if $backButton}
                        <button type="button" class="btn btn-link text-body p-0" aria-label={t.nav.back} onclick={() => history.back()}
                                style="margin: -2rem 0">
                            <i class="bi-arrow-left fs-1"></i>
                        </button>
                    {/if}
                    {$title}
                </h1>
                {@render children?.()}
            </div>
        </div>
    </div>
{/await}