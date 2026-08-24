<script lang="ts">
    import SignupPage from '$lib/features/auth/components/SignupPage.svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);
</script>

<SignupPage {t} />