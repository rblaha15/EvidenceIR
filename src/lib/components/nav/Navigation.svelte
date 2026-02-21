<script lang="ts">
    import { currentUser } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import { readableQueue } from '$lib/client/offlineQueue.svelte';
    import QueueModal from '$lib/components/nav/QueueModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';
    import { page } from '$app/state';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { hideNav } from '$lib/helpers/globals';
    import Icon from '$lib/components/Icon.svelte';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { isOnline } from '$lib/client/realtimeOnline';
    import Button from '$lib/components/Button.svelte';

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);

    const isLoggedIn = $derived($currentUser != null);
</script>

{#snippet help()}
    <Button icon="help" iconClass="fs-2" label={t.nn.title}
            link class="nav-link ms-3" href={relUrl('/help')} />
{/snippet}
{#snippet settings()}
    <Button icon="settings" iconClass="fs-2" label="Settings"
            link class="nav-link ms-3" modalID="settings" />
{/snippet}
{#snippet queue()}
    {#if $readableQueue.length}
        <div class="ms-3">
            <Button icon="sync_problem" iconClass="fs-2" label="Offline queue"
                    link class="nav-link text-warning-emphasis" modalID="queue" />
        </div>
    {/if}
{/snippet}
{#snippet buttons()}
    {@render queue()}
    {@render help()}
    {@render settings()}
    <UserDropdown {t} />
{/snippet}
{#snippet header()}
    {#snippet header()}
        <!--suppress CheckImageSize -->
        <img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
        <span class="fw-semibold">{tn.appName}</span>
    {/snippet}

    {#if $hideNav}
        {@render header()}
    {:else}
        <a class="navbar-brand d-flex align-content-center" href="/">
            {@render header()}
        </a>
    {/if}
{/snippet}

<nav class="navbar navbar-expand-md gray flex-wrap">
    <div class="container-fluid">
        {#if isLoggedIn && !$hideNav}
            <Button label="Menu" icon="menu" iconClass="fs-1" link
                    class="d-md-none me-2 nav-link" offcanvasID="NOC" />
        {/if}
        {@render header()}
        {#if !$isOnline && !$hideNav}
            <Icon icon="wifi_off" />
        {/if}
        <div class="me-auto me-lg-3"></div>
        {#if isLoggedIn && !$hideNav}
            <div class="d-none d-md-flex d-lg-none flex-row ms-auto ms-md-0">
                {@render buttons()}
            </div>
            <div class="d-none d-md-block d-lg-none w-100"></div> <!-- Row break -->
            <div class="d-none d-md-inline me-auto">
                <BaseNav {t} />
            </div>
            <div class="d-flex d-md-none d-lg-flex flex-row ms-auto ms-md-0">
                {@render buttons()}
            </div>
            <div class="d-md-none offcanvas offcanvas-start" tabindex="-1" id="NOC">
                <div class="offcanvas-header">
                    {@render header()}
                    <button class="btn btn-link nav-link ms-auto" data-bs-dismiss="offcanvas" aria-label="Close">
                        <Icon icon="close" />
                    </button>
                </div>
                <div class="offcanvas-body">
                    <BaseNav {t} />
                    {#if page.route.id?.includes('[form=form]')}
                        <hr />
                        {#key page.url.pathname + page.url.search}
                            <div class="d-md-none toc">
                                <TableOfContents {t} />
                            </div>
                        {/key}
                    {/if}
                </div>
            </div>
        {:else}
            <div class="d-none d-md-inline me-auto"></div>
            {@render settings()}
            {#if !$hideNav}
                <div class="d-flex flex-row">
                    <LoggedOutButtons {t} />
                </div>
            {/if}
        {/if}
    </div>
</nav>

<QueueModal {t} />
<SettingsModal {t} />

<style global>
    .navbar {
        background-color: lightgray;
    }

    :root[data-bs-theme="dark"] {
        .navbar {
            background-color: dimgray;
        }
    }

    .nav-link {
        --bs-nav-link-hover-color: var(--bs-link-color);
    }
</style>
