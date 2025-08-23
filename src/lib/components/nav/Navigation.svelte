<script lang="ts">
    import { currentUser } from '$lib/client/auth';
    import { isOnline } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import LanguageSelector from './LanguageSelector.svelte';
    import Settings from '$lib/components/nav/Settings.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import { readableQueue } from '$lib/client/offlineQueue';
    import QueueModal from '$lib/components/nav/QueueModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav)

    const isLoggedIn = $derived($currentUser != null);
</script>

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
                <i class="bi-list fs-1"></i>
            </button>
        {/if}
        <!--suppress CheckImageSize -->
        <img alt="Logo" class="d-inline me-2" height="32" src="/ic_r.png" width="32" />
        <span class="navbar-brand fw-semibold">{tn.appName}</span>
        {#if !$isOnline}
            <i class="bi-wifi-off fs-4"></i>
        {/if}
        <div class="me-auto"></div>
        {#if isLoggedIn}
            <div class="d-flex flex-row ms-auto ms-md-0">
                {#if $readableQueue.length}
                    <div class="ms-3">
                        <button aria-label="Offline queue" class="btn btn-link nav-link text-warning-emphasis" data-bs-target="#queue"
                                data-bs-toggle="modal">
                            <i class="bi-wifi-off fs-2"></i>
                            <i class="bi-database-fill-exclamation fs-2" style="margin-left: -.5rem"></i>
                        </button>
                    </div>
                {/if}
                <button aria-label="Settings" class="btn btn-link nav-link ms-3" data-bs-target="#settings" data-bs-toggle="modal">
                    <i class="bi-gear-fill fs-2"></i>
                </button>
                <UserDropdown {t} />
            </div>
            <div class="w-100"></div>
            <div class="d-none d-md-inline me-auto">
                <BaseNav {t} />
            </div>
            <div class="d-md-none offcanvas offcanvas-start" tabindex="-1" id="NOC">
                <div class="offcanvas-header">
                    <!--suppress CheckImageSize -->
                    <img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
                    <span class="navbar-brand fw-semibold">{tn.appName}</span>
                    <button class="btn btn-link nav-link ms-auto" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="bi-x fs-1"></i>
                    </button>
                </div>
                <div class="offcanvas-body">
                    <BaseNav {t} />
                </div>
            </div>
        {:else}
            <div class="ms-auto">
                <LanguageSelector />
            </div>
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
