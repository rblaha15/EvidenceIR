<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Navigation from '$lib/components/Navigation.svelte';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import authentication from '$lib/client/authentication';
	import { changePassword } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import type { PageData } from './$types';

	export let data: PageData

	let email = browser ? $page.url.searchParams.get('email') ?? data.email ?? '' : '';

	const t: Translations = data.translations;

	const oobCode = browser ? $page.url.searchParams.get('oobCode') : null;

	let heslo: string;
	let sending = false;
	let hesloZnovu: string;

	let redirect: string = '/';
	let nacita = true;
	onMount(() => {
		nacita = false;
		redirect = $page.url.searchParams.get('redirect') ?? '/';
	});

	let error: string | null = null;
	const sent = Boolean($page.url.searchParams.get('sent'));

	const sendCode = async () => {
		sending = true;
		await authentication('sendPasswordResetEmail', {
			email,
			redirect,
			lang: data.languageCode
		});
		window.location.replace($relUrl('/newPassword?sent=true'));
	};

	const resetPassword = async () => {
		error = '';
		if (heslo != hesloZnovu) {
			error = t.passwordsDoNotMatch;
			return;
		}
		await authentication('enableUser', { email });
		changePassword(oobCode!, heslo)
			.then(() => (window.location.href = $relUrl(`/login?email=${email}&redirect=${redirect}`)))
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
			});
	};
</script>

{#if nacita}
	<div class="spinner-border text-danger m-2" />
{:else}
	<Navigation {t} />
	<div class="container my-3">
		<h1>{t.newPassword}</h1>

		{#if sent}
			<p>Email odeslán. Nyní můžete toto okno zavřít.</p>
		{:else if sending}
			<div class="d-flex align-items-center">
				<span>Odesílání</span>
				<div class="spinner-border text-danger ms-2" />
			</div>
		{:else if !oobCode}
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
					<button type="submit" class="btn btn-primary me-2" on:click={sendCode}>
						{t.sendConfirmEmail}
					</button>
					<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
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
					<button type="submit" class="btn btn-primary me-2" on:click={resetPassword}>
						{t.save}
					</button>
					<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
						{t.back}
					</button>
				</div>
			</form>
		{/if}
	</div>
{/if}
