<script lang="ts">
    import { currentUser } from '$lib/client/auth';
    import { isOnline } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import LanguageSelector from './LanguageSelector.svelte';
    import Settings from '$lib/components/nav/Settings.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import { readableQueue } from '$lib/client/offlineQueue.svelte';
    import QueueModal from '$lib/components/nav/QueueModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav)

    const isLoggedIn = $derived($currentUser != null);
</script>

{#snippet settings()}
    <button aria-label="Settings" class="btn btn-link nav-link ms-3" data-bs-target="#settings" data-bs-toggle="modal">
        <span class="material-icons fs-2">settings</span>
    </button>
{/snippet}
{#snippet queue()}
    {#if $readableQueue.length}
        <div class="ms-3">
            <button aria-label="Offline queue" class="btn btn-link nav-link text-warning-emphasis" data-bs-target="#queue"
                    data-bs-toggle="modal">
                <span class="material-icons fs-2">sync_problem</span>
            </button>
        </div>
    {/if}
{/snippet}
{#snippet header()}
    <!--suppress CheckImageSize -->
    <img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
    <span class="navbar-brand fw-semibold">{tn.appName}</span>
{/snippet}

<nav class="navbar navbar-expand-md gray flex-wrap">
    <div class="container-fluid">
        {#if isLoggedIn}
            <button
                class="d-md-none me-2 btn nav-link btn-link"
                data-bs-toggle="offcanvas"
                data-bs-target="#NOC"
                aria-controls="NOC"
                aria-label="Menu"
            >
                <span class="material-icons fs-1">menu</span>
            </button>
        {/if}
        {@render header()}
        {#if !$isOnline}
            <span class="material-icons">wifi_off</span>
        {/if}
        <div class="me-auto"></div>
        {#if isLoggedIn}
            <div class="d-flex flex-row ms-auto ms-md-0">
                {@render queue()}
                {@render settings()}
                <UserDropdown {t} />
            </div>
            <div class="w-100"></div> <!-- Row break -->
            <div class="d-none d-md-inline me-auto">
                <BaseNav {t} />
            </div>
            <div class="d-md-none offcanvas offcanvas-start" tabindex="-1" id="NOC">
                <div class="offcanvas-header">
                    {@render header()}
                    <button class="btn btn-link nav-link ms-auto" data-bs-dismiss="offcanvas" aria-label="Close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="offcanvas-body">
                    <BaseNav {t} />
                </div>
            </div>
        {:else}
            {@render settings()}
            <div class="d-flex flex-row">
                <LoggedOutButtons {t} />
            </div>
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
