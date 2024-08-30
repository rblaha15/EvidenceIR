<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { isUserAdmin, logOut, currentUser } from '$lib/client/auth';
	import authentication from '$lib/client/authentication';
	import { responsiblePerson } from '$lib/client/realtime';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';
	import BaseNav from './BaseNav.svelte';
	import LanguageSelector from './LanguageSelector.svelte';

	export let t: Translations;

	$: prihlasenyEmail = $currentUser?.email ?? '';
	$: osoba = $responsiblePerson ?? t.no_Person;
	$: jePrihlasen = $currentUser != null;
</script>

<nav class="navbar navbar-expand-md sticky-top gray flex-wrap">
	<div class="container-fluid">
		{#if jePrihlasen}
			<button
				type="button"
				class="d-md-none me-2 btn navbar-toggler"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-label="Menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path
						d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
					/>
				</svg>
			</button>
		{/if}
		<img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
		<span class="navbar-brand me-sm-3 me-auto">{t.appName}</span>
		{#if jePrihlasen}
			<div class="d-none d-md-inline me-auto">
				<BaseNav {t} />
			</div>
			<div class="d-flex flex-row ms-auto ms-md-0">
				<div>
					<LanguageSelector />
				</div>
				<div class="dropdown">
					<button type="button" class="ms-2 btn" data-bs-toggle="dropdown" aria-label="User">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
						</svg>
					</button>
					<ul class="dropdown-menu dropdown-menu-end">
						<li><span class="dropdown-item-text">{t.email}:<br />{prihlasenyEmail}</span></li>
						<li><span class="dropdown-item-text">{t.responsiblePerson}:<br />{osoba}</span></li>
						<li><hr class="dropdown-divider" /></li>
						<li>
							<button
								on:click={async () => {
									const { link } = await authentication('getPasswordResetLink', {
										email: prihlasenyEmail,
										lang: $page.data.languageCode,
										redirect:
											$page.url.pathname.slice($page.data.languageCode.length + 1) +
											$page.url.search,
										mode: 'edit'
									});
									window.location.replace(link);
								}}
								class="dropdown-item text-warning">{t.changePassword}</button
							>
						</li>
						<li>
							<button class="dropdown-item text-danger" on:click={logOut}>{t.toLogOut}</button>
						</li>
						{#if $isUserAdmin && !$page.route.id?.endsWith('admin')}
							<li>
								<a href={$relUrl('/admin')} class="dropdown-item text-info">Upravit seznam lidí</a>
							</li>
						{/if}
					</ul>
				</div>
			</div>
			<div class="w-100" />
			<div class="d-md-none ms-1">
				<BaseNav {t} />
			</div>
		{:else}
			<div class="ms-auto">
				<LanguageSelector />
			</div>
			<div class="d-flex flex-row">
				{#if !$page.route.id?.endsWith('login')}
					<a
						href={browser
							? $relUrl(
									`/login?redirect=${$page.url.searchParams.get('redirect') ?? $page.url.pathname.slice($page.data.languageCode.length + 1) + $page.url.search}`
								)
							: ''}
						class="btn btn-info ms-2">{t.toLogIn}</a
					>
				{/if}
				{#if !$page.route.id?.endsWith('signup')}
					<a
						href={browser
							? $relUrl(
									`/signup?redirect=${$page.url.searchParams.get('redirect') ?? $page.url.pathname.slice($page.data.languageCode.length + 1) + $page.url.search}`
								)
							: ''}
						class="btn btn-success ms-2">{t.toSignUp}</a
					>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		background-color: lightgray;
	}
	@media (prefers-color-scheme: dark) {
		.navbar {
			background-color: dimgray;
		}
	}
</style>
