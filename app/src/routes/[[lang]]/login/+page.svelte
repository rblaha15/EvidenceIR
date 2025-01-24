<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { logIn } from '$lib/client/auth';
	import FormDefaults from '$lib/components/FormDefaults.svelte';
	import { relUrl } from '$lib/helpers/stores';
	import { type Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import { setTitle } from '$lib/helpers/title.svelte';

	const t: Translations = page.data.translations;

	const done = browser ? <'reset' | 'edit' | 'register'>page.url.searchParams.get('done') : null;

	let email = $state(browser ? page.url.searchParams.get('email') ?? '' : '');
	let password = $state('');
	let redirect = $state('/new');
	onMount(() => (redirect = page.url.searchParams.get('redirect') ?? '/new'));

	let signUpLink = $derived(relUrl(
		`/signup?email=${email}&redirect=${redirect}`
	));
	let resetLink = $derived(relUrl(
		`/newPassword?email=${email}&mode=resetEmail&redirect=${redirect}`
	));

	let error: string | null = $state(null);

	function prihlasitSe() {
		error = '';
		logIn(email, password)
			.then(() => (window.location.href = page.url.origin + relUrl(redirect)))
			.catch((e) => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = t.checkInternet;
				} else if (e.code == 'auth/user-not-found' || e.code == 'auth/user-disabled') {
					error = t.inexistantEmailHtml.parseTemplate({ link: signUpLink });
				} else if (e.code == 'auth/wrong-password') {
					error = t.wrongPasswordHtml.parseTemplate({ link: resetLink });
				} else if (e.code == 'auth/missing-password') {
					error = t.fillInPassword;
				} else if (e.code == 'auth/too-many-requests') {
					error = t.tooManyRequests;
				} else {
					error = t.somethingWentWrong;
				}
			});
	}
	setTitle(t.logIn)
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
		<button type="submit" class="btn btn-primary me-2" onclick={prihlasitSe}>
			{t.toLogIn}
		</button>
		<button type="button" class="btn btn-outline-secondary" onclick={() => history.back()}>
			{t.back}
		</button>
	</div>
	<p class="mt-3">
		{t.dontHaveAccount}
		<a class="btn btn-link" href={signUpLink}>{t.toSignUp}</a>
	</p>
</form>
