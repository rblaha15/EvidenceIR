<script lang="ts">
    import ic_r from '$lib/assets/ic_r.png';
    import { currentUser } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import NavItems from './NavItems.svelte';
    import UserDropdown from '$lib/components/nav/UserDropdown.svelte';
    import LoggedOutButtons from '$lib/components/nav/LoggedOutButtons.svelte';
    import HistoryModal from '$lib/components/nav/HistoryModal.svelte';
    import SettingsModal from '$lib/components/nav/SettingsModal.svelte';
    import { hideNav } from '$lib/helpers/globals';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { isOnline } from '$lib/client/realtimeOnline';
    import { Button } from '$lib/components/ui/button';
    import { CircleQuestionMark, WifiOff } from "@lucide/svelte";
    import NavSheet from "$lib/components/nav/NavSheet.svelte";

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);

    const isLoggedIn = $derived($currentUser != null);
    const showSecrets = $derived(!$hideNav);
</script>

{#snippet header()}
    {#snippet header()}
        <img src={ic_r} alt="Logo" class="inline size-8" />
        <span class="font-semibold">{tn.appName}</span>
    {/snippet}

    {#if showSecrets}
        <a class="flex items-center gap-2" href="/">
            {@render header()}
        </a>
    {:else}
        {@render header()}
    {/if}
{/snippet}

<nav class="fixed top-0 inset-x-0 bg-secondary text-secondary-foreground p-2 gap-2 flex flex-col">
    <div class="flex items-center gap-2 justify-between">
        <div class="flex items-center gap-2">
            {#if isLoggedIn && showSecrets}
                <NavSheet {t} {header} />
            {/if}
            {@render header()}
            {#if !$isOnline && showSecrets}
                <WifiOff />
            {/if}
            {#if isLoggedIn && showSecrets}
                <ul class="hidden lg:flex gap-1">
                    <NavItems {t} />
                </ul>
            {/if}
        </div>
        <div class="flex items-center gap-2">
            {#if isLoggedIn && showSecrets}
                <HistoryModal {t} />
                <Button size="icon" variant="ghost" href={relUrl('/help')}>
                    <CircleQuestionMark class="size-8" />
                    <span class="sr-only">{t.nn.title}</span>
                </Button>
            {/if}
            <SettingsModal {t} />
            {#if isLoggedIn && showSecrets}
                <UserDropdown {t} />
            {/if}
            {#if !isLoggedIn && showSecrets}
                <LoggedOutButtons {t} />
            {/if}
        </div>
    </div>
    {#if isLoggedIn && showSecrets}
        <ul class="hidden md:flex lg:hidden items-center gap-1">
            <NavItems {t} />
        </ul>
    {/if}
</nav>
