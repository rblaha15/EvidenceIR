<script lang="ts">
    import authentication from '$lib/client/authentication.js';
    import { page } from '$app/state';
    import { currentUser, isUserAdmin, isUserAnyRegulusOrAdmin, logOut } from '$lib/client/auth.js';
    import { loyaltyProgramDataStore, responsiblePerson } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';
    import { aA } from '$lib/helpers/stores';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { logEvent } from 'firebase/analytics';
    import { analytics } from '../../../hooks.client';
    import { CircleUser, Gift, LogOut, RectangleEllipsis, ShieldCogCorner } from "@lucide/svelte";
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuGroup,
        DropdownMenuGroupHeading,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger
    } from "$lib/components/ui/dropdown-menu";
    import { buttonVariants } from "$lib/components/ui/button";

    const { t }: { t: Translations } = $props();
    const ta = $derived(t.auth);

    const loggedInEmail = $derived($currentUser?.email ?? '');

    const changePassword = async () => {
        const { link } = await authentication('getPasswordResetLink', {
            email: loggedInEmail,
            lang: page.data.languageCode,
            redirect: page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
            mode: 'edit',
        });
        await goto(link, { replaceState: true });
    };
</script>

<DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <CircleUser class="size-8" />
        <span class="sr-only">User</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
        <DropdownMenuGroup aria-label="User info">
            {#if $currentUser?.displayName}
                <DropdownMenuLabel>{$currentUser?.displayName}</DropdownMenuLabel>
            {/if}
            <DropdownMenuLabel>{ta.email}: {loggedInEmail}</DropdownMenuLabel>
            {#if $responsiblePerson}
                <DropdownMenuLabel>{ta.responsiblePerson}: {$responsiblePerson}</DropdownMenuLabel>
            {/if}
            {#if $currentUser?.uid && $isUserAdmin}
                <DropdownMenuLabel>UID:{$aA}<br />{$currentUser?.uid}</DropdownMenuLabel>
            {/if}
        </DropdownMenuGroup>
        {#if !$isUserAnyRegulusOrAdmin && $loyaltyProgramDataStore}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuGroupHeading>{ta.loyaltyProgram}</DropdownMenuGroupHeading>
                <DropdownMenuLabel>
                    {ta.currentPointBalance}: {$loyaltyProgramDataStore.points}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => goto(relUrl('/rewards'))}>
                    <Gift />
                    {ta.rewards}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        {/if}
        <DropdownMenuSeparator />
        <DropdownMenuGroup aria-label="User login actions">
            <DropdownMenuItem onSelect={changePassword}>
                <RectangleEllipsis />
                {ta.changePassword}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
                logEvent(analytics(), 'logout', { email: loggedInEmail });
                logOut();
            }} variant="destructive">
                <LogOut />
                {ta.toLogOut}
            </DropdownMenuItem>
        </DropdownMenuGroup>
        {#if $isUserAdmin}
            <DropdownMenuSeparator />
            <DropdownMenuGroup aria-label="User login actions">
                <DropdownMenuItem onSelect={() => goto(relUrl('/admin'))}>
                    <ShieldCogCorner />
                    Admin{$aA}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>