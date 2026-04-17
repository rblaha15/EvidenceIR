<script lang="ts">
    import ic_r from '$lib/assets/ic_r.png';
    import { currentUser } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import BaseNav from './BaseNav.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import { readableHistory } from '$lib/client/history.svelte';
    import HistoryModal from '$lib/components/nav/HistoryModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';
    import { page } from '$app/state';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { hideNav } from '$lib/helpers/globals';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { isOnline } from '$lib/client/realtimeOnline';
    import Button from '$lib/components/Button.svelte';
    import { CircleQuestionMark, CloudAlert, Menu, Settings, WifiOff, X } from "@lucide/svelte";

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);

    const isLoggedIn = $derived($currentUser != null);
</script>

{#snippet help()}
    <Button icon={CircleQuestionMark} iconClass="size-8" label={t.nn.title}
            variant="link" size="icon-lg" class="nav-link ms-4" href={relUrl('/help')} />
{/snippet}
{#snippet settings()}
    <Button icon={Settings} iconClass="size-8" label="Settings"
            variant="link" size="icon-lg" class="nav-link ms-4" modalID="settings" />
{/snippet}
{#snippet history()}
    {#if $readableHistory.incompleted.length}
        <div class="ms-4">
            <Button icon={CloudAlert} iconClass="size-8" label="History"
                    variant="link" class="nav-link text-warning-emphasis" modalID="history" />
        </div>
    {:else if $readableHistory.completed.length}
        <div class="ms-4">
            <Button icon={CloudAlert} iconClass="size-8" label="History"
                    variant="link" class="nav-link" modalID="history" />
        </div>
    {/if}
{/snippet}
{#snippet buttons()}
    {@render history()}
    {@render help()}
    {@render settings()}
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

<nav class="navbar navbar-expand-md gray flex-wrap">
    <div class="container-fluid">
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
            <div class="hidden md:flex lg:hidden flex-row ms-auto md:ms-0">
                {@render buttons()}
            </div>
            <div class="hidden md:block lg:hidden w-full"></div> <!-- Row break -->
            <div class="hidden md:inline me-auto">
                <BaseNav {t} />
            </div>
            <div class="flex md:hidden lg:flex flex-row ms-auto md:ms-0">
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
            {@render settings()}
            {#if !$hideNav}
                <div class="flex flex-row">
                    <LoggedOutButtons {t} />
                </div>
            {/if}
        {/if}
    </div>
</nav>

<HistoryModal {t} />
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
