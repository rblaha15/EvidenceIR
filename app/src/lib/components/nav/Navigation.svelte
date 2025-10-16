<script lang="ts">
    import { currentUser } from '$lib/client/auth';
    import { isOnline } from '$lib/client/realtime';
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

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);

    const isLoggedIn = $derived($currentUser != null);
</script>

{#snippet settings()}
    <button aria-label="Settings" class="btn btn-link nav-link ms-3" data-bs-target="#settings" data-bs-toggle="modal">
        <Icon icon="settings" class="fs-2" />
    </button>
{/snippet}
{#snippet queue()}
    {#if $readableQueue.length}
        <div class="ms-3">
            <button aria-label="Offline queue" class="btn btn-link nav-link text-warning-emphasis" data-bs-target="#queue"
                    data-bs-toggle="modal">
                <Icon icon="sync_problem" class="fs-2" />
            </button>
        </div>
    {/if}
{/snippet}
{#snippet buttons()}
    {@render queue()}
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
            <button
                class="d-md-none me-2 btn nav-link btn-link"
                data-bs-toggle="offcanvas"
                data-bs-target="#NOC"
                aria-controls="NOC"
                aria-label="Menu"
            >
                <Icon icon="menu" class="fs-1" />
            </button>
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
                    {#if page.route.id?.includes('[form]')}
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
