<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { logIn } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';
	import { onMount } from 'svelte';

	const format = function (format: string, ...args: string[]) {
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};

	let nacita = true;
	onMount(() => (nacita = false));

	const t: Translations = $page.data.translations;

	let email = browser ? $page.url.searchParams.get('email') ?? '' : '';
	let password: string;
	let redirect: string = '/';
	onMount(() => (redirect = $page.url.searchParams.get('redirect') ?? '/'));

	$: signUpLink = $relUrl(
		`/signup?email=${email}` + (redirect == '/' ? '' : `&redirect=${redirect}`)
	);
	$: resetLink = $relUrl(
		`/newPassword?email=${email}` + (redirect == '/' ? '' : `&redirect=${redirect}`)
	);

	let error: string | null = null;

	function prihlasitSe() {
		error = '';
		logIn(email, password)
			.then(() => (window.location.href = $page.url.origin + $relUrl(redirect)))
			.catch((e) => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = t.checkInternet;
				} else if (e.code == 'auth/user-not-found' || e.code == 'auth/user-disabled') {
					error = format(t.inexistantEmailHtml, signUpLink);
				} else if (e.code == 'auth/wrong-password') {
					error = format(t.wrongPassword, resetLink);
				} else if (e.code == 'auth/missing-password') {
					error = t.fillInPassword;
				} else if (e.code == 'auth/too-many-requests') {
					error = t.tooManyRequests;
				} else {
					error = t.somethingWentWrong;
				}
			});
	}
</script>

{#if nacita}
	<div class="spinner-border text-danger m-2" />
{:else}
	<Navigation {t} />
	<div class="container my-3">
		<h1>{t.logIn}</h1>
		<form>
			<FormDefaults />
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
					bind:value={password}
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
				{t.dontHaveAccount}
				<a class="btn btn-link" href={signUpLink}>{t.toSignUp}</a>
			</p>
		</form>
	</div>
{/if}
