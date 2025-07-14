<script lang="ts">
    import authentication from '$lib/client/authentication.js';
    import { page } from '$app/state';
    import { currentUser, logOut } from '$lib/client/auth.js';
    import { responsiblePerson } from '$lib/client/realtime';
    import type { Translations } from '$lib/translations';
    import { goto } from '$app/navigation';

    const { t }: { t: Translations } = $props();

    const loggedInEmail = $derived($currentUser?.email ?? '');

    const changePassword = async () => {
        const { link } = await authentication('getPasswordResetLink', {
            email: loggedInEmail,
            lang: page.data.languageCode,
            redirect: page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
            mode: 'edit'
        });
        await goto(link, { replaceState: true });
    }
</script>

<div class="dropdown ms-3">
    <button class="btn btn-link nav-link" data-bs-toggle="dropdown" aria-label="User">
        <i class="bi-person-fill fs-2"></i>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        <li>
            <span class="dropdown-item-text">
                {t.email}:<br />{loggedInEmail}
            </span>
        </li>
        {#if $responsiblePerson}
            <li>
                <span class="dropdown-item-text">
                    {t.responsiblePerson}:<br />{$responsiblePerson}
                </span>
            </li>
        {/if}
        <li>
            <hr class="dropdown-divider" />
        </li>
        <li>
            <button onclick={changePassword} class="dropdown-item text-warning">
                {t.changePassword}
            </button>
        </li>
        <li>
            <button class="dropdown-item text-danger" onclick={logOut}>
                {t.toLogOut}
            </button>
        </li>
    </ul>
</div>