<script lang="ts">
	import { page } from '$app/stores';
	import { prihlasit } from '$lib/client/auth';
	import Navigation from '$lib/components/Navigation.svelte';
	import { relUrl } from '$lib/constants';
	import type { Translations } from '$lib/translations';

	const format = function (format: string, ...args: string[]) {
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};

	const t: Translations = $page.data.translations;

	let email: string;
	let heslo: string;

	let error: string | null = null;

	function prihlasitSe() {
		error = '';
		prihlasit(email, heslo)
			.then(() => (window.location.href = `${$page.url.origin}/`))
			.catch((e) => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = t.checkInternet;
				} else if (e.code == 'auth/user-not-found') {
					error = format(t.inexistantEmailHtml, $relUrl(`/signup?email=${email}`));
				} else if (e.code == 'auth/wrong-password') {
					error = t.wrongPassword;
				} else if (e.code == 'auth/too-many-requests') {
					error = t.tooManyRequests;
				} else {
					error = t.somethingWentWrong;
				}
			});
	}
</script>

<Navigation {t} />
<div class="container my-3">
	<h1>{t.logIn}</h1>
	<form>
		<div class="mt-3">
			<input
				autocomplete="email"
				type="email"
				class="form-control"
				placeholder="Email"
				bind:value={email}
			/>
		</div>
		<div class="mt-3">
			<input
				autocomplete="current-password"
				type="password"
				class="form-control"
				placeholder="Heslo"
				bind:value={heslo}
			/>
		</div>
		{#if error}
			<p class="text-danger mt-3 mb-0">{@html error}</p>
		{/if}
		<div class="d-flex align-content-center mt-3">
			<button type="submit" class="btn btn-primary me-2" on:click={prihlasitSe}>
				{t.toLogIn}
			</button>
			<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
				{t.back}
			</button>
		</div>
		<p class="mt-3">
			{t.dontHaveAccount} <a class="btn btn-link" href={$relUrl('/signup')}>{t.toSignUp}</a>
		</p>
	</form>
</div>
