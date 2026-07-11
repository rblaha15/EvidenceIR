<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { call } from '$lib/client/db/endpoints';
    import { isOnline } from '$lib/client/online';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import { Spinner } from '$lib/components/ui/spinner';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { WifiOff } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    const t = $derived(data.translations.auth);

    let sending = $state(false);
    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');

    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);

    let error: string | null = $state(null);

    const signUp = async () => {
        sending = true;
        error = '';
        const { result } = await call('auth/trySignUp', {
            email,
            lang: page.data.languageCode,
            redirect,
        });
        sending = false;
        console.log(result);
        if (result == 'sent')
            error = t.signUpEmailSent;
        else if (result == 'emailInUse')
            error = t.emailInUse;
        else if (result == 'useBusinessEmail')
            error = t.pleaseUseBusinessEmail;
        else if (result == 'useNameSurnameEmail')
            error = t.useNameSurnameEmail;
        else
            error = t.somethingWentWrong;
    };

    onMount(() => setTitle(t.signUp, false, false, true));
</script>

{#if !$isOnline}
    <Alert variant="danger">
        <WifiOff/>
        <AlertTitle>{t.youAreOffline}</AlertTitle>
    </Alert>
{:else}
    <Card class="mx-auto mt-8 w-full max-w-sm">
        <CardHeader>
            <CardTitle class="text-xl">{t.signUp}</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
            <form>
                <FormDefaults/>
                <FieldGroup>
                    <Field>
                        <FieldLabel for="email">{t.email}</FieldLabel>
                        <Input id="email" autocomplete="email" type="email" bind:value={email}/>
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
                    <Spinner/>
                {/if}
                {t.toSignUp}
            </Button>
            <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
        </CardFooter>
    </Card>
{/if}