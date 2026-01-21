<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import authentication from '$lib/client/authentication';
	import { changePassword } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import type { PageProps } from './$types';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
	import { relUrl } from '$lib/helpers/runes.svelte';
	import { goto } from '$app/navigation';
    import { logEvent } from 'firebase/analytics';
    import { analytics } from '../../../hooks.client';
    import { grantPoints } from '$lib/client/loyaltyProgram';

	const { data }: PageProps = $props();
	const t = $derived(data.translations.auth);

	let email = $state(browser ? (page.url.searchParams.get('email') ?? data.email ?? '') : '');

	const oobCode = browser ? page.url.searchParams.get('oobCode') : null;
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

    const redirect = $derived(browser ? page.url.searchParams.get('redirect') ?? initialRouteLoggedIn: initialRouteLoggedIn);
	onMount(() => {
		mode = page.url.searchParams.get('mode') as typeof mode;
	});

	let error: string | null = $state(null);

	const sendCode = async () => {
		mode = 'resetSending';
		await authentication('sendPasswordResetEmail', {
			email,
			redirect,
			lang: data.languageCode
		});
		await goto(relUrl('/newPassword?mode=resetSent'), { replaceState: true });
	};

	const resetPassword = async () => {
		const originalMode = mode;
		mode = 'saving';
		error = '';
		if (password != confirmPassword) {
			error = t.passwordsDoNotMatch;
			mode = originalMode
			return;
		}
		if (originalMode == 'register') {
			await authentication('enableUser', { email });
		}
		await changePassword(oobCode!, password)
			.then(async () => {
                logEvent(analytics(), 'change_password', { mode: originalMode, email });
                if (originalMode == 'register') await grantPoints({ type: 'registration' });
                await goto(relUrl(`/login?email=${email}&done=${originalMode}&redirect=${redirect}`));
            })
			.catch((e) => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = t.checkInternet;
				} else if (e.code == 'auth/missing-password') {
					error = t.fillInPassword;
				} else if (e.code == 'auth/weak-password') {
					error = t.passwordTooWeak;
				} else if (e.code == 'auth/too-many-requests') {
					error = t.tooManyRequests;
				} else {
					error = t.somethingWentWrong;
				}
				mode = originalMode
			});
	};

	$effect(() => setTitle(t.newPassword))
</script>

{#if mode === 'resetSent'}
	<p>{t.emailSent}</p>
{:else if mode === 'resetSending'}
	<div class="d-flex align-items-center">
		<span>{t.sending}</span>
		<div class="spinner-border text-danger ms-2"></div>
	</div>
{:else if mode === 'resetEmail' || !oobCode}
	<form>
		<FormDefaults />
		<div class="mt-3">
			<input
				autocomplete="email"
				type="email"
				class="form-control"
				placeholder={t.email}
				bind:value={email}
			/>
		</div>
		{#if error}
			<p class="text-danger mt-3 mb-0">{@html error}</p>
		{/if}
		<div class="d-flex align-content-center mt-3">
			<button type="submit" class="btn btn-primary me-2" onclick={sendCode}>
				{t.sendConfirmEmail}
			</button>
			<button type="button" class="btn btn-secondary" onclick={() => history.back()}>
				{t.back}
			</button>
		</div>
	</form>
{:else}
	<form>
		<FormDefaults />
		<div class="mt-3">
			<input
				autocomplete="new-password"
				type="password"
				class="form-control"
				placeholder={t.password}
				bind:value={password}
			/>
		</div>
		<div class="mt-3">
			<input
				autocomplete="new-password"
				type="password"
				class="form-control"
				placeholder={t.confirmPassword}
				bind:value={confirmPassword}
			/>
		</div>
		{#if error}
			<p class="text-danger mt-3 mb-0">{@html error}</p>
		{/if}
		<div class="d-flex align-content-center mt-3">
			{#if mode === "saving"}
				<div class="spinner-border text-danger m-2"></div>
			{:else}
				<button type="submit" class="btn btn-primary me-2" onclick={resetPassword}>
					{t.save}
				</button>
			{/if}
			<button type="button" class="btn btn-secondary" onclick={() => history.back()}>
				{t.back}
			</button>
		</div>
	</form>
{/if}
