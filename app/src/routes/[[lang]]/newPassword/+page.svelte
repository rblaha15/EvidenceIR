<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { changePassword } from '$lib/client/auth';
    import { logEvent } from 'firebase/analytics';
    import { onMount } from 'svelte';
    import authentication from '$lib/client/authentication';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { analytics } from '../../../hooks.client';
    import type { PageProps } from './$types';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { goto } from '$app/navigation';
    import { Spinner } from "$lib/components/ui/spinner";
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { Check } from "@lucide/svelte";

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);

    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');

    const token = browser ? page.url.searchParams.get('token') : null;
    let mode:
        // To send an email with a reset link
        | 'resetEmail'
        | 'resetSending'
        | 'resetSent'
        // To set the password
        | 'reset'
        | 'edit'
        | 'register'
        // Operational
        | 'saving'
        | 'loading' = $state('loading');

    let password = $state('');
    let confirmPassword = $state('');

    const redirect = $derived(browser ? page.url.searchParams.get('redirect') ?? initialRouteLoggedIn : initialRouteLoggedIn);
    $effect(() => {
        mode = page.url.searchParams.get('mode') as typeof mode || 'loading';
    });

    let error = $state('');

    const sendCode = async () => {
        mode = 'resetSending';
        await authentication('sendPasswordResetEmail', {
            email,
            redirect,
            lang: data.languageCode,
        });
        await goto(relUrl('/newPassword?mode=resetSent'), { replaceState: true, invalidateAll: true });
    };

    const resetPassword = async () => {
        const originalMode = mode;
        mode = 'saving';
        error = '';
        if (password != confirmPassword) {
            error = t.passwordsDoNotMatch;
            mode = originalMode;
            return;
        }
        const result = await changePassword(token!, password);
        if (result == 'success') {
            logEvent(analytics(), 'change_password', { mode: originalMode, email });
            await goto(relUrl(`/login?email=${email}&done=${originalMode}&redirect=${redirect}`));
        } else if (result == 'INVALID_TOKEN') {
            await goto(relUrl(`/login?email=${email}&redirect=${redirect}`));
        } else if (result == 'PASSWORD_TOO_SHORT') {
            error = t.passwordTooWeak;
            mode = originalMode;
        } else {
            error = t.somethingWentWrong;
            mode = originalMode;
        }
    };

    onMount(() => setTitle(t.newPassword, false, false, true));
</script>

{#if mode === 'loading'}
    <Spinner class="m-4 size-8 text-danger" />
{:else if mode === 'resetSent'}
    <Alert variant="success">
        <Check />
        <AlertTitle>{t.emailSent}</AlertTitle>
    </Alert>
{:else if mode === 'resetSending'}
    <Alert>
        <Spinner />
        <AlertTitle>{t.sending}</AlertTitle>
    </Alert>
{:else if mode === 'resetEmail' || !token}
    <Card class="mx-auto mt-8 w-full max-w-sm">
        <CardHeader>
            <CardTitle class="text-xl">{t.newPassword}</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
            <form>
                <FormDefaults />
                <FieldGroup>
                    <Field>
                        <FieldLabel for="email">{t.email}</FieldLabel>
                        <Input id="email" autocomplete="email" type="email" bind:value={email} />
                    </Field>
                    {#if error}
                        <FieldError>{error}</FieldError>
                    {/if}
                </FieldGroup>
            </form>
        </CardContent>
        <CardFooter class="gap-2">
            <Button type="submit" class="grow" onclick={sendCode}>{t.sendConfirmEmail}</Button>
            <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
        </CardFooter>
    </Card>
{:else}
    <Card class="mx-auto mt-8 w-full max-w-sm">
        <CardHeader>
            <CardTitle class="text-xl">{t.newPassword}</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
            <form>
                <FormDefaults />
                <FieldGroup>
                    <Field>
                        <FieldLabel for="password">{t.password}</FieldLabel>
                        <Input id="password" autocomplete="new-password" type="password" bind:value={password} />
                    </Field>
                    <Field>
                        <FieldLabel for="password">{t.confirmPassword}</FieldLabel>
                        <Input id="password" autocomplete="new-password" type="password" bind:value={confirmPassword} />
                    </Field>
                    {#if error}
                        <FieldError>{error}</FieldError>
                    {/if}
                </FieldGroup>
            </form>
        </CardContent>
        <CardFooter class="gap-2">
            <Button type="submit" class="grow" onclick={resetPassword} disabled={mode === 'saving'}>
                {#if mode === 'saving'}
                    <Spinner />
                {/if}
                {t.save}
            </Button>
            <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
        </CardFooter>
    </Card>
{/if}