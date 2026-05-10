<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import type { PageProps } from './$types';
    import authentication from '$lib/client/authentication';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { goto } from '$app/navigation';
    import { logEvent } from 'firebase/analytics';
    import { analytics } from '../../../hooks.client';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { onMount } from 'svelte';
    import { Spinner } from "$lib/components/ui/spinner";

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);

    let sending = $state(false);
    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');

    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);

    let error: string | null = $state(null);

    const signUp = async () => {
        sending = true;
        error = '';
        const { enabled } = await authentication('checkEnabled', { email });
        if (enabled) {
            sending = false;
            error = t.emailInUse;
            return;
        }
        if (enabled == null && email.endsWith('@regulus.cz')) {
            if (email.split('@')[0].includes('.')) await authentication('createUser', { email });
            else {
                sending = false;
                error = t.useNameSurnameEmail;
                return;
            }
        } else if (enabled == null) {
            sending = false;
            error = t.pleaseUseBusinessEmail;
            return;
        }
        const { link } = await authentication('getPasswordResetLink', {
            email,
            lang: page.data.languageCode,
            redirect,
            mode: 'register',
        });
        logEvent(analytics(), 'sign_up', { email });
        await goto(link);
    };

    onMount(() => setTitle(t.signUp, false, false, true));
</script>

<Card class="mx-auto mt-8 w-full max-w-sm">
    <CardHeader>
        <CardTitle class="text-xl">{t.signUp}</CardTitle>
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
                    <FieldError>{@html error}</FieldError>
                {/if}
            </FieldGroup>
        </form>
    </CardContent>
    <CardFooter class="gap-2">
        <Button type="submit" class="grow" onclick={signUp} disabled={sending}>
            {#if sending}
                <Spinner />
            {/if}
            {t.toSignUp}
        </Button>
        <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
    </CardFooter>
</Card>