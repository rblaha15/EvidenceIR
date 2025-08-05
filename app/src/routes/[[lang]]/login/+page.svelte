<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { logIn, setName } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { setTitle } from '$lib/helpers/globals.js';
	import { startTechniciansListening, techniciansList } from '$lib/client/realtime';
	import { get } from 'svelte/store';
	import { relUrl } from '$lib/helpers/runes.svelte';
	import { goto } from '$app/navigation';

	const { data }: PageProps = $props();
	const t = $derived(data.translations.auth);

	const done = browser ? <'reset' | 'edit' | 'register'>page.url.searchParams.get('done') : null;

	let email = $state(browser ? page.url.searchParams.get('email') ?? '' : '');
	let password = $state('');
	let redirect = $state('/IN');
	onMount(() => {
		startTechniciansListening()
		redirect = page.url.searchParams.get('redirect') ?? '/IN'
	});

	let signUpLink = $derived(relUrl(
		`/signup?email=${email}&redirect=${redirect}`
	));
	let resetLink = $derived(relUrl(
		`/newPassword?email=${email}&mode=resetEmail&redirect=${redirect}`
	));

	let error: string | null = $state(null);

	async function signIn() {
		error = '';
		await logIn(email, password)
			.then(c =>
				setName(get(techniciansList).find(t => t.email == c.user.email)?.name).then(() =>
					goto(page.url.origin + relUrl(redirect))
				)
			)
			.catch(e => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = t.checkInternet;
				} else if (e.code == 'auth/user-not-found' || e.code == 'auth/user-disabled') {
					error = t.nonexistentEmailHtml({ link: signUpLink });
				} else if (e.code == 'auth/wrong-password') {
					error = t.wrongPasswordHtml({ link: resetLink });
				} else if (e.code == 'auth/missing-password') {
					error = t.fillInPassword;
				} else if (e.code == 'auth/too-many-requests') {
					error = t.tooManyRequests;
				} else {
					error = t.somethingWentWrong;
				}
			});
	}
	$effect(() => setTitle(t.logIn))
</script>

{#if done}
	<div class="alert alert-success" role="alert">
		{#if done === 'edit'}
			{t.passwordEdited}
		{:else if done === 'register'}
			{t.registered}
		{:else if done === 'reset'}
			{t.passwordHasBeenReset}
		{/if}
	</div>
{/if}
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
	<div class="mt-3">
		<input
			autocomplete="current-password"
			type="password"
			class="form-control"
			placeholder={t.password}
			bind:value={password}
		/>
	</div>
	{#if error}
		<p class="text-danger mt-3 mb-0">{@html error}</p>
	{/if}
	<div class="d-flex align-content-center mt-3">
		<button type="submit" class="btn btn-primary me-2" onclick={signIn}>
			{t.toLogIn}
		</button>
		<button type="button" class="btn btn-secondary" onclick={() => history.back()}>
			{t.back}
		</button>
	</div>
	<p class="mt-3">
		{t.dontHaveAccount}
		<a class="btn btn-link" href={signUpLink}>{t.toSignUp}</a>
	</p>
</form>
