<script lang="ts">
    import NewPasswordPage from '$lib/features/auth/components/NewPasswordPage.svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);
    const lang = $derived(data.languageCode);
</script>

<NewPasswordPage data={{ email: data.email, mode: data.mode, redirect: data.redirect, token: data.token }} {lang} {t} />