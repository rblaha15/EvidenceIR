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

    const { t }: { t: Translations } = $props();

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
        {#if !$isOnline}
            <span class="navbar-brand fw-semibold">{t.appName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="me-auto" viewBox="0 0 16 16">
                <path
                    d="M10.706 3.294A12.6 12.6 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4q.946 0 1.852.148zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.45 8.45 0 0 1 3.51-1.27zm2.596 1.404.785-.785q.947.362 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.5 8.5 0 0 0-1.98-.932zM8 10l.933-.933a6.5 6.5 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.53.53 0 0 1-.611.09A5.5 5.5 0 0 0 8 10m4.905-4.905.747-.747q.886.451 1.685 1.03a.485.485 0 0 1 .047.737.52.52 0 0 1-.668.05 11.5 11.5 0 0 0-1.811-1.07M9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A2 2 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75z" />
            </svg>
        {:else}
            <span class="navbar-brand fw-semibold me-auto">{t.appName}</span>
        {/if}
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
                <div class="d-none d-md-block ms-3">
                    <button aria-label="Settings" class="btn btn-link nav-link" data-bs-target="#settings" data-bs-toggle="modal">
                        <i class="bi-gear-fill fs-2"></i>
                    </button>
                </div>
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
                    <span class="navbar-brand fw-semibold">{t.appName}</span>
                    <button class="btn btn-link nav-link ms-auto" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i class="bi-x fs-1"></i>
                    </button>
                </div>
                <div class="offcanvas-body">
                    <BaseNav {t} />
                    <hr />
                    <Settings {t} />
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
