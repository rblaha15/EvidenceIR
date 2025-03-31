<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { currentUser, logOut } from '$lib/client/auth';
    import authentication from '$lib/client/authentication';
    import { isOnline, responsiblePerson } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import LanguageSelector from './LanguageSelector.svelte';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import ThemeSelector from '$lib/components/ThemeSelector.svelte';

    interface Props {
        t: Translations;
    }

    let { t }: Props = $props();

    let prihlasenyEmail = $derived($currentUser?.email ?? '');
    let osoba = $derived($responsiblePerson ?? t.no_Person);
    let jePrihlasen = $derived($currentUser != null);
</script>

<nav class="navbar navbar-expand-md sticky-top gray flex-wrap">
    <div class="container-fluid">
        {#if jePrihlasen}
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
            <span class="navbar-brand">{t.appName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="me-auto" viewBox="0 0 16 16">
                <path
                    d="M10.706 3.294A12.6 12.6 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4q.946 0 1.852.148zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.45 8.45 0 0 1 3.51-1.27zm2.596 1.404.785-.785q.947.362 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.5 8.5 0 0 0-1.98-.932zM8 10l.933-.933a6.5 6.5 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.53.53 0 0 1-.611.09A5.5 5.5 0 0 0 8 10m4.905-4.905.747-.747q.886.451 1.685 1.03a.485.485 0 0 1 .047.737.52.52 0 0 1-.668.05 11.5 11.5 0 0 0-1.811-1.07M9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A2 2 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75z" />
            </svg>
        {:else}
            <span class="navbar-brand me-auto">{t.appName}</span>
        {/if}
        {#if jePrihlasen}
            <div class="d-flex flex-row ms-auto ms-md-0">
                <div class="d-none d-md-block ms-2">
                    <ThemeSelector {t} />
                </div>
                <div class="d-none d-md-block ms-2">
                    <LanguageSelector />
                </div>
                <div class="dropdown ms-2">
                    <button class="btn btn-link nav-link" data-bs-toggle="dropdown" aria-label="User">
                        <i class="bi-person-fill fs-2"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><span class="dropdown-item-text">{t.email}:<br />{prihlasenyEmail}</span></li>
                        <li><span class="dropdown-item-text">{t.responsiblePerson}:<br />{osoba}</span></li>
                        <li>
                            <hr class="dropdown-divider" />
                        </li>
                        <li>
                            <button
                                onclick={async () => {
									const { link } = await authentication('getPasswordResetLink', {
										email: prihlasenyEmail,
										lang: page.data.languageCode,
										redirect:
											page.url.pathname.slice(page.data.languageCode.length + 1) +
											page.url.search,
										mode: 'edit'
									});
									window.location.replace(link);
								}}
                                class="dropdown-item text-warning">{t.changePassword}</button
                            >
                        </li>
                        <li>
                            <button
                                class="dropdown-item text-danger"
                                onclick={() => {
									logOut();
									window.location.reload();
								}}>{t.toLogOut}</button
                            >
                        </li>
                    </ul>
                </div>
            </div>
            <div class="w-100"></div>
            <div class="d-none d-md-inline me-auto">
                <BaseNav {t} />
            </div>
            <div class="d-md-none offcanvas offcanvas-start" tabindex="-1" id="NOC">
                <div class="offcanvas-header">
                    <!--suppress CheckImageSize -->
                    <img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
                    <span class="navbar-brand">{t.appName}</span>
                    <ThemeSelector {t} />
                    <LanguageSelector />
                    <button class="btn btn-link nav-link ms-auto" data-bs-dimdiss="offcanvas" aria-label="Close">
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
                {#if !page.route.id?.endsWith('login')}
                    <a
                        href={browser
							? relUrl(
									`/login?redirect=${page.url.searchParams.get('redirect') ?? page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search}`
								)
							: ''}
                        class="btn btn-info ms-2">{t.toLogIn}</a
                    >
                {/if}
                {#if !page.route.id?.endsWith('signup')}
                    <a
                        href={browser
							? relUrl(
									`/signup?redirect=${page.url.searchParams.get('redirect') ?? page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search}`
								)
							: ''}
                        class="btn btn-success ms-2">{t.toSignUp}</a
                    >
                {/if}
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
