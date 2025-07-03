<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import authentication from '$lib/client/authentication';
	import { changePassword } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import type { PageData } from './$types';
	import { setTitle } from '$lib/helpers/title.svelte';
	import { relUrl } from '$lib/helpers/runes.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let email = $state(browser ? (page.url.searchParams.get('email') ?? data.email ?? '') : '');

	const t: Translations = data.translations;

	const oobCode = browser ? page.url.searchParams.get('oobCode') : null;
	let mode:
		| 'resetEmail'
		| 'resetSending'
		| 'resetSent'
		| 'reset'
		| 'edit'
		| 'register'
		| 'saving'
		| 'loading' = $state('loading');

	let heslo = $state('');
	let hesloZnovu = $state('');

	let redirect: string = '/IN';
	onMount(() => {
		redirect = page.url.searchParams.get('redirect') ?? '/IN';
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
		window.location.replace(relUrl('/newPassword?mode=resetSent'));
	};

	const resetPassword = async () => {
		const originalMode = mode;
		mode = 'saving';
		error = '';
		if (heslo != hesloZnovu) {
			error = t.passwordsDoNotMatch;
			mode = originalMode
			return;
		}
		if (originalMode == 'register') {
			await authentication('enableUser', { email });
		}
		changePassword(oobCode!, heslo)
			.then(() => {
				window.location.href = relUrl(`/login?email=${email}&done=${mode}&redirect=${redirect}`);
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

	setTitle(t.newPassword)
</script>

{#if mode === 'resetSent'}
	<p>Email odeslán. Nyní můžete toto okno zavřít.</p>
{:else if mode === 'resetSending'}
	<div class="d-flex align-items-center">
		<span>Odesílání</span>
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
				bind:value={heslo}
			/>
		</div>
		<div class="mt-3">
			<input
				autocomplete="new-password"
				type="password"
				class="form-control"
				placeholder={t.confirmPassword}
				bind:value={hesloZnovu}
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
