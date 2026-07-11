<script lang="ts">
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { signIn } from '$lib/client/auth';
    import { grantPoints } from '$lib/client/loyaltyProgram';
    import { isOnline } from '$lib/client/online';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import { Spinner } from '$lib/components/ui/spinner';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { WifiOff } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);

    const done = browser ? <'reset' | 'edit' | 'register'>page.url.searchParams.get('done') : null;

    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');
    let password = $state('');
    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);

    let signUpLink = $derived(relUrl(`/signup?email=${email}&redirect=${redirect}`));
    let resetLink = $derived(relUrl(`/new-password?email=${email}&mode=resetEmail&redirect=${redirect}`));

    let error = $state('');
    let loading = $state(false);

    async function logIn() {
        error = '';
        loading = true;
        const result = await signIn(email, password);
        console.log(result);
        if (result == 'INVALID_EMAIL_OR_PASSWORD') {
            loading = false;
            error = 'wrong-password';
        } else if (result == 'INVALID_EMAIL') {
            loading = false;
            error = t.invalidEmail;
        } else if (result == 'success') {
            await grantPoints({ type: 'registration' });
            await goto(page.url.origin + relUrl(redirect));
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

{#if !$isOnline}
    <Alert variant="danger">
        <WifiOff/>
        <AlertTitle>{t.youAreOffline}</AlertTitle>
    </Alert>
{:else}
    <Card class="mx-auto mt-8 w-full max-w-sm">
        <CardHeader>
            <CardTitle class="text-xl">{t.logIn}</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
            <form>
                <FormDefaults/>
                <FieldGroup>
                    <Field>
                        <FieldLabel for="email">{t.email}</FieldLabel>
                        <Input id="email" autocomplete="email" type="email" bind:value={email}/>
                    </Field>
                    <Field>
                        <FieldLabel for="password">{t.password}</FieldLabel>
                        <Input id="password" autocomplete="current-password" type="password" bind:value={password}/>
                    </Field>
                    {#if error == 'wrong-password'}
                        <FieldError class="flex gap-1">
                            {t.invalidEmailOrPassword}
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
            <Button type="submit" class="grow" onclick={logIn} disabled={loading}>
                {#if loading}
                    <Spinner/>
                {/if}
                {t.toLogIn}
            </Button>
            <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
        </CardFooter>
    </Card>
{/if}