<script lang="ts">
    import authentication from '$lib/client/authentication.js';
    import { page } from '$app/state';
    import { currentUser, isUserAdmin, isUserAnyRegulusOrAdmin, logOut } from '$lib/client/auth.js';
    import { loyaltyProgramDataStore, responsiblePerson } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';
    import { aA } from '$lib/helpers/stores';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { logEvent } from 'firebase/analytics';
    import { analytics } from '../../../hooks.client';

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

<div class="dropdown ms-4">
    <button aria-label="User" class="btn btn-link nav-link" data-bs-toggle="dropdown">
        <Icon class="fs-2" icon="account_circle" />
    </button>
    <div class="dropdown-menu hidden dropdown-menu-end">
        <div class="flex flex-col gap-4 px-4 pt-1">
            {#if $currentUser?.displayName}
                <h5 class="m-0">
                    {$currentUser?.displayName}
                </h5>
            {/if}
            <span>
                {ta.email}:<br />{loggedInEmail}
            </span>
            {#if $responsiblePerson}
                <span>
                    {ta.responsiblePerson}:<br />{$responsiblePerson}
                </span>
            {/if}
            {#if $currentUser?.uid && $isUserAdmin}
                <span>
                    UID:{$aA}<br />{$currentUser?.uid}
                </span>
            {/if}
        </div>
        {#if !$isUserAnyRegulusOrAdmin && $loyaltyProgramDataStore}
            <hr class="my-4" />
            <div class="flex flex-col gap-1 px-4 items-start">
                <h6 class="m-0">{ta.loyaltyProgram}</h6>
                <span>{ta.currentPointBalance}: {$loyaltyProgramDataStore.points}</span>
                <a class="btn btn-secondary" href={relUrl('/rewards')}>
                    <Icon icon="loyalty" />
                    {ta.rewards}
                </a>
            </div>
        {/if}
        <hr class="my-4" />
        <div class="flex flex-col gap-1 px-4 items-start">
            <button class="btn btn-warning" onclick={changePassword}>
                <Icon icon="password" />
                {ta.changePassword}
            </button>
            <button class="btn btn-danger" onclick={() => {
                logEvent(analytics(), 'logout', { email: loggedInEmail });
                logOut();
            }}>
                <Icon icon="logout" />
                {ta.toLogOut}
            </button>
        </div>
        {#if $isUserAdmin}
            <hr class="my-4" />
            <div class="px-4 pb-1">
                <a class="btn btn-info" href={relUrl('/admin')}>
                    <Icon icon="admin_panel_settings" />
                    Admin{$aA}
                </a>
            </div>
        {/if}
    </div>
</div>