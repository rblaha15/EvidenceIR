<script lang="ts">
    import { user, isAdmin, isAnyRegulusOrAdmin, signOut } from '$lib/client/auth.js';
    import { fetchLoyaltyProgramData, fetchMyInfo, loyaltyProgramData, myInfo } from '$lib/client/db/arrays';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';
    import { aA } from '$lib/helpers/stores';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { logEvent } from 'firebase/analytics';
    import { onMount } from 'svelte';
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

    const userEmail = $derived($user?.email ?? '');

    const changePassword = async () => {
        // TODO!!!
    };

    onMount(fetchLoyaltyProgramData);
    onMount(fetchMyInfo);
</script>

<DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <CircleUser class="size-8" />
        <span class="sr-only">User</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
        <DropdownMenuGroup aria-label="User info">
            {#if $user?.name}
                <DropdownMenuLabel>{$user?.name}</DropdownMenuLabel>
            {/if}
            <DropdownMenuLabel>{ta.email}: {userEmail}</DropdownMenuLabel>
            {#if $myInfo}
                <DropdownMenuLabel>{ta.responsiblePerson}: {$myInfo.responsiblePerson}</DropdownMenuLabel>
            {/if}
            {#if $user?.id && $isAdmin}
                <DropdownMenuLabel>UID:{$aA}<br />{$user?.id}</DropdownMenuLabel>
            {/if}
        </DropdownMenuGroup>
        {#if !$isAnyRegulusOrAdmin && $loyaltyProgramData}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuGroupHeading>{ta.loyaltyProgram}</DropdownMenuGroupHeading>
                <DropdownMenuLabel>
                    {ta.currentPointBalance}: {$loyaltyProgramData.points}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => goto(relUrl('/rewards'))}>
                    <Gift />
                    {ta.rewards}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        {/if}
        <DropdownMenuSeparator />
        <DropdownMenuGroup aria-label="User login actions">
            <DropdownMenuItem onSelect={changePassword} variant="warning">
                <RectangleEllipsis />
                {ta.changePassword}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
                logEvent(analytics(), 'logout', { email: userEmail });
                signOut();
            }} variant="danger">
                <LogOut />
                {ta.toLogOut}
            </DropdownMenuItem>
        </DropdownMenuGroup>
        {#if $isAdmin}
            <DropdownMenuSeparator />
            <DropdownMenuGroup aria-label="User login actions">
                <DropdownMenuItem onSelect={() => goto(relUrl('/admin'))} variant="tertiary">
                    <ShieldCogCorner />
                    Admin{$aA}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>