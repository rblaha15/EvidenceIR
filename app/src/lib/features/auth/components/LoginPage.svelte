<script lang="ts">
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { signIn, tryFirebase } from '$lib/client/auth';
    import { grantPoints } from '$lib/client/loyaltyProgram';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import AuthUI from '$lib/features/auth/components/AuthUI.svelte';
    import { appUrl, initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';

    const { t }: { t: Translations['auth'] } = $props();

    const done = browser ? <'reset' | 'edit' | 'register'>page.url.searchParams.get('done') : null;
    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);

    const signUpLink = (email: string) => relUrl(`/signup?email=${email}&redirect=${redirect}`);

    let error = $state('');
    let sending = $state(false);

    async function logIn({ email, password }: { email: string; password: string }) {
        error = '';
        sending = true;
        const result = await signIn(email, password);
        console.log(result);
        if (result == 'INVALID_EMAIL_OR_PASSWORD') {
            const resultF = await tryFirebase(email, password);
            if (resultF) return await goto(appUrl + relUrl(redirect));

            sending = false;
            error = 'wrong-password';
        } else if (result == 'INVALID_EMAIL') {
            sending = false;
            error = t.invalidEmail;
        } else if (result == 'success') {
            setTimeout(() => grantPoints({ type: 'registration' }), 500);
            await goto(appUrl + relUrl(redirect));
        } else {
            sending = false;
            error = result;
        }
    }

    onMount(() => setTitle(t.logIn, false, false, true));
</script>

{#if done}
    <Alert variant="success">
        <AlertTitle>
            {#if done === 'register'}
                {t.registered}
            {:else if done === 'reset'}
                {t.passwordHasBeenReset}
            {/if}
        </AlertTitle>
    </Alert>
{/if}

<AuthUI {error} {sending} show={{ email: true, password: true }} submit={logIn} submitLabel={t.toLogIn} {t}
        title={t.logIn}>
    {#snippet footer({ email })}
        {t.dontHaveAccount}
        <Button variant="link" href={signUpLink(email)}>{t.signUp}</Button>
    {/snippet}
</AuthUI>