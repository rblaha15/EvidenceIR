<script lang="ts">
    import LoginPage from '$lib/features/auth/components/LoginPage.svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);
</script>

<LoginPage {t} />