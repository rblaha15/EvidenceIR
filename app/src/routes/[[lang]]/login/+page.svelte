<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { signIn } from '$lib/client/auth';
    import { fetchPeople, fetchTechnicians } from '$lib/client/db/arrays';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { goto } from '$app/navigation';
    import { logEvent } from 'firebase/analytics';
    import { analytics } from '../../../hooks.client';
    import { grantPoints } from '$lib/client/loyaltyProgram';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);

    const done = browser ? <'reset' | 'edit' | 'register'>page.url.searchParams.get('done') : null;

    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');
    let password = $state('');
    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);
    onMount(() => {
        fetchTechnicians();
        fetchPeople();
    });

    let signUpLink = $derived(relUrl(`/signup?email=${email}&redirect=${redirect}`));
    let resetLink = $derived(relUrl(`/newPassword?email=${email}&mode=resetEmail&redirect=${redirect}`));

    let error = $state('');

    async function logIn() {
        error = '';
        await signIn(email, password)
            .then(async a => {
                console.log(a);
                logEvent(analytics(), 'login', { email });
                await grantPoints({ type: 'registration' });
                await goto(page.url.origin + relUrl(redirect));
            })
            .catch(e => {
                console.log('Login error', e, { ...e });
                if (e.code == 'auth/network-request-failed') {
                    error = t.checkInternet;
                } else if (e.code == 'auth/user-not-found' || e.code == 'auth/user-disabled') {
                    error = 'not-found';
                } else if (e.code == 'auth/wrong-password') {
                    error = 'wrong-password';
                } else if (e.code == 'auth/missing-password') {
                    error = t.fillInPassword;
                } else if (e.code == 'auth/too-many-requests') {
                    error = t.tooManyRequests;
                } else {
                    error = t.somethingWentWrong;
                }
            });
    }
    onMount(() => setTitle(t.logIn, false, false, true));
</script>

{#if done}
    <Alert variant="success">
        <AlertTitle>
            {#if done === 'edit'}
                {t.passwordEdited}
            {:else if done === 'register'}
                {t.registered}
            {:else if done === 'reset'}
                {t.passwordHasBeenReset}
            {/if}
        </AlertTitle>
    </Alert>
{/if}

<Card class="mx-auto mt-8 w-full max-w-sm">
    <CardHeader>
        <CardTitle class="text-xl">{t.logIn}</CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4">
        <form>
            <FormDefaults />
            <FieldGroup>
                <Field>
                    <FieldLabel for="email">{t.email}</FieldLabel>
                    <Input id="email" autocomplete="email" type="email" bind:value={email} />
                </Field>
                <Field>
                    <FieldLabel for="password">{t.password}</FieldLabel>
                    <Input id="password" autocomplete="current-password" type="password" bind:value={password} />
                </Field>
                {#if error == 'not-found'}
                    <FieldError>
                        {t.nonexistentEmail}
                        <Button variant="link" href={signUpLink}>{t.createIt}</Button>
                    </FieldError>
                {:else if error == 'wrong-password'}
                    <FieldError>
                        {t.wrongPassword}
                        <Button variant="link" href={resetLink}>{t.forgottenPassword}</Button>
                    </FieldError>
                {:else if error}
                    <FieldError>{error}</FieldError>
                {/if}
            </FieldGroup>
        </form>
        <p class="">
            {t.dontHaveAccount}
            <Button variant="link" href={signUpLink}>{t.signUp}</Button>
        </p>
    </CardContent>
    <CardFooter class="gap-2">
        <Button type="submit" class="grow" onclick={logIn}>{t.toLogIn}</Button>
        <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
    </CardFooter>
</Card>