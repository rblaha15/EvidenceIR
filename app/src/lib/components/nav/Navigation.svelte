<script lang="ts">
    import ic_r from '$lib/assets/ic_r.png';
    import { currentUser } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import HistoryModal from '$lib/components/nav/HistoryModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';
    import { page } from '$app/state';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { hideNav } from '$lib/helpers/globals';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { isOnline } from '$lib/client/realtimeOnline';
    import Button from '$lib/components/Button.svelte';
    import { CircleQuestionMark, Menu, WifiOff, X } from "@lucide/svelte";

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);

    const isLoggedIn = $derived($currentUser != null);
</script>

{#snippet buttons()}
    <HistoryModal {t} />
    <Button icon={CircleQuestionMark} size="icon" iconClass="size-8" label={t.nn.title}
            variant="ghost" href={relUrl('/help')} />
    <SettingsModal {t} />
    <UserDropdown {t} />
{/snippet}

{#snippet header()}
    {#snippet header()}
        <!--suppress CheckImageSize -->
        <img src={ic_r} alt="Logo" width="32" height="32" class="inline me-2" />
        <span class="fw-semibold">{tn.appName}</span>
    {/snippet}

    {#if $hideNav}
        {@render header()}
    {:else}
        <a class="navbar-brand flex align-content-center" href="/">
            {@render header()}
        </a>
    {/if}
{/snippet}

<nav class="navbar navbar-expand-md fixed top-0 inset-x-0 h-14 flex bg-background items-center gap-4">
    {#if isLoggedIn && !$hideNav}
        <Button label="Menu" icon={Menu} iconClass="size-8" variant="link"
                class="md:hidden me-2 nav-link" offcanvasID="NOC" />
    {/if}
    {@render header()}
    {#if !$isOnline && !$hideNav}
        <WifiOff />
    {/if}
    <div class="me-auto lg:me-4"></div>
    {#if isLoggedIn && !$hideNav}
        <div class="hidden md:flex lg:hidden flex-row ms-auto md:ms-0 gap-2">
            {@render buttons()}
        </div>
        <div class="hidden md:block lg:hidden w-full"></div> <!-- Row break -->
        <div class="hidden md:inline me-auto">
            <BaseNav {t} />
        </div>
        <div class="flex md:hidden lg:flex flex-row ms-auto md:ms-0 gap-2">
            {@render buttons()}
        </div>
        <div class="md:hidden offcanvas offcanvas-start" tabindex="-1" id="NOC">
            <div class="offcanvas-header">
                {@render header()}
                <button class="btn btn-link nav-link ms-auto" data-bs-dismiss="offcanvas" aria-label="Close">
                    <X />
                </button>
            </div>
            <div class="offcanvas-body">
                <BaseNav {t} />
                {#if page.route.id?.includes('[form=form]')}
                    <hr />
                    {#key page.url.pathname + page.url.search}
                        <div class="md:hidden toc">
                            <TableOfContents {t} />
                        </div>
                    {/key}
                {/if}
            </div>
        </div>
    {:else}
        <div class="hidden md:inline me-auto"></div>
        <SettingsModal {t} />
        {#if !$hideNav}
            <div class="flex flex-row">
                <LoggedOutButtons {t} />
            </div>
        {/if}
    {/if}
</nav>
