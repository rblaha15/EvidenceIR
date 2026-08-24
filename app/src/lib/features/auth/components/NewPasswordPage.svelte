<script lang="ts">
    import { goto } from '$app/navigation';
    import { editPassword, signUp } from '$lib/client/auth';
    import { call } from '$lib/client/db/endpoints';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Spinner } from '$lib/components/ui/spinner';
    import AuthUI from '$lib/features/auth/components/AuthUI.svelte';
    import type { NewPasswordData } from '$lib/features/auth/domain/loadNewPassword';
    import { appUrl, initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { Translations } from '$lib/translations';
    import { Check } from '@lucide/svelte';
    import { onMount } from 'svelte';

    const { data, t, lang }: {
        data: NewPasswordData;
        t: Translations['auth'];
        lang: LanguageCode;
    } = $props();

    // svelte-ignore state_referenced_locally
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
        | 'loading' = $state(data.mode);

    const redirect = $derived(data.redirect || initialRouteLoggedIn);

    let error = $state('');

    const sendCode = async ({ email }: { email: string }) => {
        mode = 'resetSending';
        await call('auth/sendPasswordResetEmail', {
            email, redirect, lang,
        });
        await goto(relUrl('/new-password?mode=resetSent'), { replaceState: true, invalidateAll: true });
        mode = 'resetSent';
    };

    const resetPassword = async ({ currentPassword, newPassword, confirmPassword }: {
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    }) => {
        const originalMode = mode;
        mode = 'saving';
        error = '';
        if (newPassword != confirmPassword) {
            error = t.passwordsDoNotMatch;
            mode = originalMode;
            return;
        }
        const result = originalMode == 'register'
            ? await signUp(data.token, data.email, newPassword)
            : originalMode == 'reset'
                ? await call('auth/setPassword', {
                    token: data.token,
                    email: data.email,
                    password: newPassword
                }).then(r => r.result)
                : await editPassword(currentPassword, newPassword);
        console.log(result);
        if (result == 'success') {
            if (originalMode == 'edit')
                await goto(appUrl + relUrl(redirect));
            else
                await goto(relUrl(`/login?email=${data.email}&done=${originalMode}&redirect=${redirect}`));
        } else if (result == 'PASSWORD_TOO_SHORT') {
            error = t.passwordTooWeak;
            mode = originalMode;
        } else if (result == 'INVALID_PASSWORD') {
            error = t.wrongPassword;
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
{:else if mode === 'resetEmail'}
    <AuthUI {error} show={{ email: true }} submit={sendCode} submitLabel={t.sendConfirmEmail} {t}
            title={t.newPassword} />
{:else}
    <AuthUI {error} sending={mode === 'saving'}
            show={{ currentPassword: mode == 'edit', password: true, newPassword: true }} submit={resetPassword}
            submitLabel={t.save} {t} title={t.newPassword} />
{/if}