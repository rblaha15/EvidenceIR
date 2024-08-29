<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import authentication from '$lib/client/authentication';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	
	let nacita = true;
	onMount(() => (nacita = false));

	let email = browser ? $page.url.searchParams.get('email') ?? '' : '';

	const t: Translations = $page.data.translations;

	let redirect: string = '/new';
	onMount(() => (redirect = $page.url.searchParams.get('redirect') ?? '/new'));

	let error: string | null = null;

	const signUp = async () => {
		error = '';
		const { enabled } = await authentication('checkEnabled', { email });
		if (enabled) {
			error = t.emailInUse;
			return;
		}
		if (enabled == null && email.endsWith('@regulus.cz')) {
			await authentication('createUser', { email });
		} else if (enabled == null) {
			error = t.pleaseUseBuisnessEmail;
			return;
		}
		const { link } = await authentication('getPasswordResetLink', {
			email,
			lang: $page.data.languageCode,
			redirect,
			mode: 'register',
		});
		window.location.href = link;
	};
</script>

<h1>{t.signUp}</h1>

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
		<button type="submit" class="btn btn-primary me-2" on:click={signUp}>
			{t.toSignUp}
		</button>
		<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
			{t.back}
		</button>
	</div>
</form>
