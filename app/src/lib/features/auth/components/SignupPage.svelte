<script lang="ts">
    import { page } from '$app/state';
    import { call } from '$lib/client/db/endpoints';
    import AuthUI from '$lib/features/auth/components/AuthUI.svelte';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals';
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';

    const { t }: { t: Translations['auth'] } = $props();

    let error = $state<string | null>(null);
    let sending = $state(false);

    const signUp = async ({ email }: { email: string }) => {
        sending = true;
        error = '';
        const { result } = await call('auth/trySignUp', {
            email,
            lang: page.data.languageCode,
            redirect: page.url.searchParams.get('redirect') ?? initialRouteLoggedIn,
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

<AuthUI {error} {sending} show={{ email: true }} submit={signUp} submitLabel={t.toSignUp} {t} title={t.signUp} />