<script lang="ts">
    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { checkAuth } from '$lib/client/auth';
    import Navigation from '$lib/components/nav/Navigation.svelte';
    import { preferredLanguage } from '$lib/languages';
    import { onMount, type Snippet } from 'svelte';
    import { progress, title } from '$lib/helpers/title.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';
    import QueueModal from '$lib/components/nav/QueueModal.svelte';

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    const t = page.data.translations;

    let nacita = $state(true);
    onMount(async () => {
        await checkAuth();
        nacita = false;
    });
    onMount(() => {
        import('bootstrap');
        const currentLangLength = page.params.lang?.length ?? -1;
        if (!page.data.areTranslationsFromRoute)
            window.location.replace(
                '/' +
                preferredLanguage() +
                page.url.pathname.slice(currentLangLength + 1) +
                page.url.search +
                page.url.hash,
            );
    });
</script>

<svelte:head>
    <style lang="scss">
      @use 'bootstrap/scss/bootstrap';
      @use '../../lib/components/input-groups.css';

      @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
    </style>

    <title>{dev ? '(dev) ' : ''}SEIR :: {$title}</title>
</svelte:head>

{#if nacita}
    <div class="spinner-border text-danger m-2"></div>
{:else}
    <QueueModal {t} />
    <SettingsModal {t} />
    <div class="sticky-top">
        <Navigation {t} />
        <div class="progress rounded-0" role="progressbar"
             style:scale="1 {$progress === 'load' ? 1 : 0}"
             style="transition: scale .5s; transform-origin: top;"
        >
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger rounded-0"
                 style:width="{$progress === 'load' ? 90 : $progress === 'done' ? 100 : 0}%"
                 style="transition: width 5s;"
            ></div>
        </div>
    </div>
    <div class="container my-2 d-flex flex-column gap-3">
        <h1 class="m-0">{$title}</h1>
        {@render children?.()}
    </div>
{/if}