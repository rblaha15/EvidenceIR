<script lang="ts">
    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { checkAuth } from '$lib/client/auth';
    import Navigation from '$lib/components/nav/Navigation.svelte';
    import { preferredLanguage } from '$lib/languages';
    import { onMount, type Snippet } from 'svelte';
    import { backButton, progress, title } from '$lib/helpers/title.svelte';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    const t = page.data.translations as Translations;

    let nacita = $state(true);
    onMount(async () => {
        await checkAuth();
        nacita = false;
    });
    onMount(() => {
        import('bootstrap');
        const currentLangLength = page.params.lang?.length ?? -1;
        if (!page.data.areTranslationsFromRoute)
            goto(
                '/' +
                preferredLanguage() +
                page.url.pathname.slice(currentLangLength + 1) +
                page.url.search +
                page.url.hash,
                { replaceState: true },
            );
    });
</script>

<svelte:head>
    <style lang="scss">
      @use 'bootstrap/scss/bootstrap';
      @use '../../lib/components/input-groups.css';

      @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap');

      :root {
        --bs-font-sans-serif: 'Open Sans', sans-serif;
      }

      :root, html, body, body > div {
        height: 100%;
      }
    </style>

    <title>{dev ? '(dev) ' : ''}SEIR :: {$title}</title>
</svelte:head>

{#if nacita}
    <div class="spinner-border text-danger m-2"></div>
{:else}
    <div class="d-flex flex-column h-100">
        <Navigation {t} />
        <div class="flex-grow-1 overflow-y-scroll">
            <div class="sticky-top progress rounded-0" role="progressbar"
                 style:scale="1 {$progress === 'load' ? 1 : 0}"
                 style="transition: scale .5s; transform-origin: top;"
            >
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger rounded-0"
                     style:width="{$progress === 'load' ? 90 : $progress === 'done' ? 100 : 0}%"
                     style="transition: width 5s;"
                ></div>
            </div>
            <div class="container my-2 d-flex flex-column gap-3">
                <h1 class="m-0 d-flex align-items-center gap-3">
                    {#if $backButton}
                        <button type="button" class="btn btn-link text-body p-0" aria-label={t.back} onclick={() => history.back()}
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
{/if}