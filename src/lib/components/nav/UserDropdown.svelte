<script lang="ts">
    import authentication from '$lib/client/authentication.js';
    import { page } from '$app/state';
    import { currentUser, logOut } from '$lib/client/auth.js';
    import { responsiblePerson } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';

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
        <span class="material-icons fs-2">account_circle</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        {#if $currentUser?.displayName}
            <li>
                <span class="dropdown-item-text">
                    {$currentUser?.displayName}
                </span>
            </li>
        {/if}
        <li>
            <span class="dropdown-item-text">
                {ta.email}:<br />{loggedInEmail}
            </span>
        </li>
        {#if $responsiblePerson}
            <li>
                <span class="dropdown-item-text">
                    {ta.responsiblePerson}:<br />{$responsiblePerson}
                </span>
            </li>
        {/if}
        <li>
            <hr class="dropdown-divider" />
        </li>
        <li>
            <button class="dropdown-item text-warning" onclick={changePassword}>
                {ta.changePassword}
            </button>
        </li>
        <li>
            <button class="dropdown-item text-danger" onclick={logOut}>
                {ta.toLogOut}
            </button>
        </li>
    </ul>
</div>