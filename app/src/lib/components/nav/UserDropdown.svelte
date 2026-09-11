<script lang="ts">
    import { user, isAdmin, isAnyRegulusOrAdmin, signOut } from '$lib/client/auth.js';
    import arrays from '$lib/client/db/arrays';
    import { aA } from '$lib/helpers/newStores';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { onMount } from 'svelte';
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

    onMount(arrays.fetchLoyaltyProgramData);
    onMount(arrays.fetchMyInfo); // TODO
</script>

<DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'regulus-ghost', size: 'icon' })}>
        <CircleUser class="size-8" />
        <span class="sr-only">User</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-fit me-2">
        <DropdownMenuGroup aria-label="User info">
            {#if $user?.name}
                <DropdownMenuLabel>{$user?.name}</DropdownMenuLabel>
            {/if}
            <DropdownMenuLabel>{ta.email}: {userEmail}</DropdownMenuLabel>
            {#if arrays.myInfoValue}
                <DropdownMenuLabel>{ta.responsiblePerson}: {arrays.myInfoValue.responsiblePerson}</DropdownMenuLabel>
            {/if}
        </DropdownMenuGroup>
        {#if !$isAnyRegulusOrAdmin && arrays.loyaltyProgramDataValue}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuGroupHeading>{ta.loyaltyProgram}</DropdownMenuGroupHeading>
                <DropdownMenuLabel>
                    {ta.currentPointBalance}: {arrays.loyaltyProgramDataValue.points}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => goto(relUrl('/rewards'))}>
                    <Gift />
                    {ta.rewards}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        {/if}
        <DropdownMenuSeparator />
        <DropdownMenuGroup aria-label="User login actions">
            <DropdownMenuItem onSelect={() => goto(relUrl(`/new-password?mode=edit`))} variant="warning">
                <RectangleEllipsis />
                {ta.changePassword}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={signOut} variant="danger">
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