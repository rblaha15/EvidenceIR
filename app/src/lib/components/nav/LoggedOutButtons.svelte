<script lang="ts">
    import { page } from '$app/state';
    import { relUrl } from '$lib/helpers/runes.svelte.js';
    import type { Translations } from '$lib/translations';

    const { t }: { t: Translations } = $props();
    const ta = $derived(t.auth)

    const redirect = $derived(
        page.url.searchParams.get('redirect')
        ?? page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
    );
</script>

{#if !page.route.id?.endsWith('login')}
    <a href={relUrl(`/login?redirect=${redirect}`)} class="btn btn-info ms-2">
        {ta.toLogIn}
    </a>
{/if}
{#if !page.route.id?.endsWith('signup')}
    <a href={relUrl(`/signup?redirect=${redirect}`)} class="btn btn-success ms-2">
        {ta.toSignUp}
    </a>
{/if}