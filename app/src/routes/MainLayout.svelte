<script lang="ts">
    import type { LayoutData } from './$types';
    import { getIsLoggedIn, isLoggedIn, user } from '$lib/client/auth';
    import Navigation from '$lib/components/nav/Navigation.svelte';
    import { onMount, type Snippet } from 'svelte';
    import { backButton, endLoading, hideNav, hideTitle, initialRouteLoggedIn, initialRouteLoggedOut, progress, startLoading, title } from '$lib/helpers/globals';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { preferredLanguage, setUserPreferredLanguage } from '$lib/languages';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { EventHandler } from 'svelte/elements';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { analytics } from '../hooks.client';
    import { setUserId } from '@firebase/analytics';
    import { ArrowLeft, OctagonAlert } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { Separator } from '$lib/components/ui/separator';
    import { Spinner } from '$lib/components/ui/spinner';

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

    const currentLangLength = $derived(data.isLanguageFromUrl ? (data.languageCode?.length ?? -1) : -1);
    const path = $derived(page.url.pathname.slice(currentLangLength + 1) || '/');

    const fixUrl = async () => {
        if (path == '/') {
            const isLoggedIn = await getIsLoggedIn();
            const route = isLoggedIn ? initialRouteLoggedIn : initialRouteLoggedOut;
            const lang = data.isLanguageFromUrl ? data.languageCode : '?';
            return await goto(relUrl(route, lang));
        }
        if (!data.isLanguageFromUrl)
            return await goto('/' + preferredLanguage() + path + page.url.search + page.url.hash, { replaceState: true, invalidateAll: true });
        setUserPreferredLanguage(data.languageCode);
        document.documentElement.lang = data.languageCode;
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
        setUserId(analytics(), $user?.id || null);
    });

    const showTOC = $derived(page.route.id?.includes('[form=form]') && !page.error);
</script>

<svelte:window onunhandledrejection={handleError} />

<svelte:head>
    <title>{dev ? '(dev) ' : ''}SEIR :: {$title}</title>
</svelte:head>

{#snippet loading()}
    <Spinner class="m-4 size-8 text-danger" />
{/snippet}

{#snippet errorAlert(error: E)}
    <Alert variant="danger" class="m-4">
        <OctagonAlert />
        <AlertTitle>{error.name}</AlertTitle>
        <AlertDescription>
            {#each error.message.split('\n') as line}
                <span class="block">{line}</span>
            {/each}
            {#if error.fileName || error.lineNumber || error.columnNumber}
                <Separator />
                <p class="text-end">{error.fileName}:{error.lineNumber}:{error.columnNumber}</p>
            {/if}
        </AlertDescription>
    </Alert>
{/snippet}

{#snippet content()}
    <Navigation {t} />
    <div class={['flex h-full flex-col', $isLoggedIn && !$hideNav ? 'pt-13 md:pt-24 lg:pt-13' : 'pt-13']}>
        <div
            class="rounded-0 sticky top-0"
            role="progressbar"
            style:scale="1 {$progress === 'load' ? 1 : 0}"
            style="transition: scale .5s; transform-origin: top;"
        >
            <div
                class="progress-bar progress-bar-striped progress-bar-animated rounded-0 bg-danger"
                style:width="{$progress === 'load' ? 90 : $progress === 'done' ? 100 : 0}%"
                style="transition: width 5s;"
            ></div>
        </div>
        <div class="grow overflow-y-auto [scrollbar-gutter:stable]">
            <main class="flex min-h-full w-full justify-center gap-4 px-4 pb-2 md:px-8">
                <div class="flex w-full flex-col gap-4 pt-4 has-[+.toc]:max-w-2xl">
                    {#if !$hideTitle}
                        <h1 id="main-title" class="flex items-center gap-4">
                            {#if $backButton}
                                <Button size="icon" variant="ghost" onclick={() => history.back()}>
                                    <ArrowLeft class="size-8" />
                                    <span class="sr-only">{t.nav.back}</span>
                                </Button>
                            {/if}
                            {$title}
                        </h1>
                    {/if}
                    {@render children?.()}
                </div>
                {#if showTOC}
                    {#key page.url.pathname + page.url.search}
                        <div class="toc sticky top-0 hidden h-full w-96 pt-4 md:block">
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
    {#await getIsLoggedIn()}
        {#if !error}
            {@render loading()}
        {:else}
            {@render errorAlert(error)}
        {/if}
    {:then _}
        {@render content()}
    {/await}
{/if}
