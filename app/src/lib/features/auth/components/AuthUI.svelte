<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { isOnline } from '$lib/client/online';
    import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import { Spinner } from '$lib/components/ui/spinner';
    import { initialRouteLoggedIn } from '$lib/helpers/globals';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { Translations } from '$lib/translations';
    import { WifiOff } from '@lucide/svelte';
    import type { Snippet } from 'svelte';

    const { t, submit, submitLabel, title, show, footer, error, sending }: {
        t: Translations['auth'];
        submit: (_: {
            email: string,
            password: string,
            currentPassword: string,
            newPassword: string,
            confirmPassword: string,
        }) => void;
        submitLabel: string;
        title: string;
        show: {
            email?: boolean;
            password?: boolean;
            currentPassword?: boolean;
            newPassword?: boolean;
            confirmPassword?: boolean;
        };
        footer?: Snippet<[{
            email: string,
            password: string,
            currentPassword: string,
            newPassword: string,
            confirmPassword: string,
        }]>;
        error: string | null;
        sending?: boolean;
    } = $props();

    let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');
    let password = $state('');
    let currentPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');

    const redirect = $derived(browser ? (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn) : initialRouteLoggedIn);
    const resetLink = $derived(relUrl(`/new-password?email=${email}&mode=resetEmail&redirect=${redirect}`));
</script>

{#if !$isOnline}
    <Alert variant="danger">
        <WifiOff />
        <AlertTitle>{t.youAreOffline}</AlertTitle>
    </Alert>
{:else}
    <form>
        <Card class="mx-auto mt-8 w-full max-w-sm">
            <CardHeader>
                <CardTitle class="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent class="grid gap-4">
                <FormDefaults />
                <FieldGroup>
                    {#if show.email}
                        <Field>
                            <FieldLabel for="email">{t.email}</FieldLabel>
                            <Input id="email" autocomplete="email" type="email" bind:value={email} />
                        </Field>
                    {:else}
                        <Input autocomplete="email" type="hidden" bind:value={email} />
                    {/if}
                    {#if show.password}
                        <Field>
                            <FieldLabel for="password">{t.password}</FieldLabel>
                            <Input id="password" autocomplete="current-password" type="password"
                                   bind:value={password} />
                        </Field>
                    {/if}
                    {#if show.currentPassword}
                        <Field>
                            <FieldLabel for="currentPassword">{t.currentPassword}</FieldLabel>
                            <Input id="currentPassword" autocomplete="current-password" type="password"
                                   bind:value={currentPassword} />
                        </Field>
                    {/if}
                    {#if show.newPassword}
                        <Field>
                            <FieldLabel for="newPassword">{t.password}</FieldLabel>
                            <Input id="newPassword" autocomplete="new-password" type="password"
                                   bind:value={newPassword} />
                        </Field>
                    {/if}
                    {#if show.confirmPassword}
                        <Field>
                            <FieldLabel for="confirmPassword">{t.confirmPassword}</FieldLabel>
                            <Input id="confirmPassword" autocomplete="new-password" type="password"
                                   bind:value={confirmPassword} />
                        </Field>
                    {/if}
                    {#if error == 'wrong-password'}
                        <FieldError class="flex gap-1">
                            {t.invalidEmailOrPassword}
                            <Button variant="link" href={resetLink}>{t.forgottenPassword}</Button>
                        </FieldError>
                    {:else if error}
                        <FieldError>{error}</FieldError>
                    {/if}
                </FieldGroup>
                {#if footer}
                    <p>{@render footer({
                        email, password, currentPassword, newPassword, confirmPassword,
                    })}</p>
                {/if}
            </CardContent>
            <CardFooter class="gap-2">
                <Button type="submit" class="grow" onclick={() => submit({
                    email, password, currentPassword, newPassword, confirmPassword,
                })} disabled={sending}>
                    {#if sending}
                        <Spinner />
                    {/if}
                    {submitLabel}
                </Button>
                <Button variant="secondary" onclick={() => history.back()}>{t.back}</Button>
            </CardFooter>
        </Card>
    </form>
{/if}