<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { zmenitHeslo } from '$lib/client/auth';
	import Navigation from '$lib/components/Navigation.svelte';
	import type { Translations } from '$lib/translations';

	let email = browser ? $page.url.searchParams.get('email') ?? '' : '';

	const t: Translations = $page.data.translations;

	let heslo: string;
	let hesloZnovu: string;

	let error: string | null = null;

	function registrovatSe() {
		error = '';
		if (heslo === hesloZnovu) {
			zmenitHeslo(email, heslo)
				.then(() => (window.location.href = `${$page.url.origin}/`))
				.catch((e) => {
					console.log(e.code);
					if (e.code == 'auth/network-request-failed') {
						error = t.checkInternet;
					} else if (e.code == 'auth/weak-password') {
						error = t.passwordTooWeak;
					} else if (e.code == 'auth/user-not-found') {
						error = t.pleaseUseBuisnessEmail;
					} else if (e.code == 'auth/email-already-in-use') {
						error = t.emailInUse;
					} else {
						error = t.somethingWentWrong;
					}
				});
		} else {
			error = t.passwordsDoNotMatch;
		}
	}
</script>

<Navigation {t} />
<div class="container my-3">
	<h1>{t.signUp}</h1>

	<form>
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
			<button type="submit" class="btn btn-primary me-2" on:click={registrovatSe}>
				{t.toSignUp}
			</button>
			<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
				{t.back}
			</button>
		</div>
	</form>
</div>
