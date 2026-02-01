<script lang="ts">
    import type { LayoutData } from './$types';
    import { checkAuth, userInfo } from '$lib/client/auth';
    import Navigation from '$lib/components/nav/Navigation.svelte';
    import { onMount, type Snippet } from 'svelte';
    import {
        backButton,
        endLoading,
        initialRouteLoggedIn,
        initialRouteLoggedOut,
        progress,
        startLoading,
        title,
    } from '$lib/helpers/globals';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { preferredLanguage, setUserPreferredLanguage } from '$lib/languages';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { EventHandler } from 'svelte/elements';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { analytics } from '../hooks.client';
    import { setUserId } from '@firebase/analytics';

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

    const currentLangLength = $derived(data.isLanguageFromUrl ? data.languageCode?.length ?? -1 : -1);
    const path = $derived(page.url.pathname.slice(currentLangLength + 1) || '/');

    const fixUrl = async () => {
        if (path == '/') {
            const isLoggedIn = await checkAuth();
            const route = isLoggedIn ? initialRouteLoggedIn : initialRouteLoggedOut;
            const lang = data.isLanguageFromUrl ? data.languageCode : '?';
            return await goto(relUrl(route, lang));
        }
        if (!data.isLanguageFromUrl) return await goto(
            '/' +
            preferredLanguage() +
            path +
            page.url.search +
            page.url.hash,
            { replaceState: true, invalidateAll: true },
        );
        setUserPreferredLanguage(data.languageCode)
        document.documentElement.lang = data.languageCode
    };
    $effect(() => {
        page.url;
        fixUrl();
    });

    type E = { name: string; message: string; fileName: any; lineNumber: any; columnNumber: any };
    let error = $state<E>();

    const handleError: EventHandler<PromiseRejectionEvent, Window> = e => {
        const r = e.reason as Error;
        if (r.message.startsWith('ServiceWorker')) return;
        error = {
            name: r.name,
            message: r.message,
            fileName: 'fileName' in r ? r.fileName || '' : '',
            lineNumber: 'lineNumber' in r ? r.lineNumber || '' : '',
            columnNumber: 'columnNumber' in r ? r.columnNumber || '' : '',
        };
    };

    $effect(() => {
        setUserId(analytics(), $userInfo?.uid || null);
    })
</script>

<svelte:window onunhandledrejection={handleError} />

<svelte:head>
    <title>{dev ? '(dev) ' : ''}SEIR :: {$title}</title>
</svelte:head>

{#snippet loading()}
    <div class="spinner-border text-danger m-3"></div>
{/snippet}

{#snippet errorAlert(error: E)}
    <div class="alert alert-danger m-3 d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
            <Icon icon="error_outline" />
            <h4 class="alert-heading m-0">{error.name}</h4>
        </div>
        <p class="m-0">
            {#each error.message.split('\n') as line, i}
                {#if i !== 0}<br />{/if}
                {line}
            {/each}
        </p>
        {#if error.fileName || error.lineNumber || error.columnNumber}
            <hr class="m-0" />
            <p class="w-100 text-end m-0">{error.fileName}:{error.lineNumber}:{error.columnNumber}</p>
        {/if}
    </div>
{/snippet}

{#snippet content()}
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
            <main class="container d-flex gap-3">
                <div class="mt-3 d-flex flex-column gap-3 w-100">
                    <h1 id="main-title" class="m-0 d-flex align-items-center gap-3">
                        {#if $backButton}
                            <button type="button" class="btn btn-link text-body p-0" aria-label={t.nav.back} onclick={() => history.back()}
                                    style="margin: -2rem 0">
                                <Icon icon="arrow_back" class="fs-1" />
                            </button>
                        {/if}
                        {$title}
                    </h1>
                    {@render children?.()}
                </div>
                {#if page.route.id?.includes('[form=form]') && !page.error}
                    {#key page.url.pathname + page.url.search}
                        <div class="d-none d-md-block position-sticky top-0 pt-3 end-0 h-100 toc">
                            <TableOfContents {t} />
                        </div>
                    {/key}
                {/if}
            </main>
        </div>
    </div>
{/snippet}

{#if !data.isLanguageFromUrl || path === '/'}
    {@render loading()}
{:else}
    {#await checkAuth()}
        {#if !error}
            {@render loading()}
        {:else}
            {@render errorAlert(error)}
        {/if}
    {:then _}
        {@render content()}
    {/await}
{/if}