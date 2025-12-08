<script lang="ts">
    import authentication from '$lib/client/authentication.js';
    import { page } from '$app/state';
    import { currentUser, isUserAdmin, logOut } from '$lib/client/auth.js';
    import { responsiblePerson } from '$lib/client/realtime';
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

<div class="dropdown ms-3">
    <button aria-label="User" class="btn btn-link nav-link" data-bs-toggle="dropdown">
        <Icon icon="account_circle" class="fs-2" />
    </button>
    <div class="dropdown-menu dropdown-menu-end">
        <div class="d-flex flex-column gap-3 px-3 pt-1">
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
        </div>
        <hr class="my-3" />
        <div class="d-flex flex-column gap-1 px-3 align-items-start">
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
            <hr class="my-3" />
            <div class="px-3 pb-1">
                <a class="btn btn-info" href={relUrl('/admin')}>
                    <Icon icon="admin_panel_settings" />
                    Admin{$aA}
                </a>
            </div>
        {/if}
    </div>
</div>