<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import authentication from '$lib/client/authentication';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
    import { initialRouteLoggedIn, setTitle } from '$lib/helpers/globals.js';
	import { goto } from '$app/navigation';

	const { data }: PageProps = $props();
	const t = $derived(data.translations.auth);

	let sending = $state(false);
	let email = $state(browser ? (page.url.searchParams.get('email') ?? '') : '');

	const redirect = $derived(browser ? page.url.searchParams.get('redirect') ?? initialRouteLoggedIn : initialRouteLoggedIn);

	let error: string | null = $state(null);

	const signUp = async () => {
		sending = true;
		error = '';
		const { enabled } = await authentication('checkEnabled', { email });
		if (enabled) {
			sending = false;
			error = t.emailInUse;
			return;
		}
		if (enabled == null && email.endsWith('@regulus.cz')) {
			if (email.split('@')[0].includes('.'))
				await authentication('createUser', { email });
			else {
				sending = false;
				error = t.useNameSurnameEmail;
				return;
			}
		} else if (enabled == null) {
			sending = false;
			error = t.pleaseUseBusinessEmail;
			return;
		}
		const { link } = await authentication('getPasswordResetLink', {
			email,
			lang: page.data.languageCode,
			redirect,
			mode: 'register'
		});
		await goto(link);
	};

	$effect(() => setTitle(t.signUp))
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
		{#if sending}
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
