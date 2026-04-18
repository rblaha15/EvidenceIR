<script lang="ts">
    import { page } from '$app/state';
    import { relUrl } from '$lib/helpers/runes.svelte.js';
    import type { Translations } from '$lib/translations';
    import { Button } from "$lib/components/ui/button";

    const { t }: { t: Translations } = $props();
    const ta = $derived(t.auth)

    const redirect = $derived(
        page.url.searchParams.get('redirect')
        ?? page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
    );
</script>

{#if !page.route.id?.endsWith('login')}
    <Button href={relUrl(`/login?redirect=${redirect}`)}>
        {ta.toLogIn}
    </Button>
{/if}
{#if !page.route.id?.endsWith('signup')}
    <Button href={relUrl(`/signup?redirect=${redirect}`)} variant="outline">
        {ta.toSignUp}
    </Button>
{/if}