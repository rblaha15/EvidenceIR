<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import authentication from '$lib/client/authentication';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import { setTitle } from '$lib/helpers/title.svelte';

	let odesila = $state(false);
	let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');

	const t: Translations = page.data.translations;

	let redirect: string = '/new';
	onMount(() => (redirect = page.url.searchParams.get('redirect') ?? '/new'));

	let error: string | null = $state(null);

	const signUp = async () => {
		odesila = true;
		error = '';
		const { enabled } = await authentication('checkEnabled', { email });
		if (enabled) {
			odesila = false;
			error = t.emailInUse;
			return;
		}
		if (enabled == null && email.endsWith('@regulus.cz')) {
			if (email.split('@')[0].includes('.'))
				await authentication('createUser', { email });
			else {
				odesila = false;
				error = 'Prosím, použijte email se jménem i příjmením';
				return;
			}
		} else if (enabled == null) {
			odesila = false;
			error = t.pleaseUseBusinessEmail;
			return;
		}
		const { link } = await authentication('getPasswordResetLink', {
			email,
			lang: page.data.languageCode,
			redirect,
			mode: 'register'
		});
		window.location.href = link;
	};

	setTitle(t.signUp)
</script>

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
		{#if odesila}
			<div class="spinner-border text-danger m-2"></div>
		{:else}
			<button type="submit" class="btn btn-primary me-2" onclick={signUp}>
				{t.toSignUp}
			</button>
		{/if}
		<button type="button" class="btn btn-secondary" onclick={() => history.back()}>
			{t.back}
		</button>
	</div>
</form>
