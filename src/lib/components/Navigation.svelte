<script lang="ts">
	import { page } from '$app/stores';
	import { isUserAdmin, logOut, currentUser } from '$lib/client/auth';
	import { zodpovednaOsoba } from '$lib/client/realtime';
		import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';
	import { redirect } from '@sveltejs/kit';
	import LanguageSelector from './LanguageSelector.svelte';

	export let t: Translations;

	$: prihlasenyEmail = $currentUser?.email ?? '';
	$: osoba = $zodpovednaOsoba ?? t.no_Person;
	$: jePrihlasen = $currentUser != null;
</script>

<nav class="navbar sticky-top gray flex-wrap">
	<div class="container-fluid">
		<img src="/ic_r.png" alt="Logo" width="32" height="32" class="d-inline me-2" />
		<span class="navbar-brand me-sm-3 me-auto">{t.appName}</span>
		{#if jePrihlasen}
			<ul class="navbar-nav me-auto d-none d-md-flex flex-row">
				<a class="nav-link" href={$relUrl('/')}>{t.home}</a>
				<a class="nav-link ms-3" href={$relUrl('/search')}>{t.controllerSearch}</a>
			</ul>

			<div class="d-flex flex-row ms-auto ms-md-0">
				<div>
					<LanguageSelector />
				</div>
				<div class="dropdown">
					<button type="button" class="ms-2 btn" data-bs-toggle="dropdown">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								class="d-md-none"
								d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
							/>
							<path
								class="d-none d-md-inline"
								d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
							/>
						</svg>
					</button>
					<ul class="dropdown-menu dropdown-menu-end">
						<li>
							<a class="dropdown-item d-md-none" href={$relUrl('/')}>{t.home}</a>
							<a class="dropdown-item d-md-none" href={$relUrl('/search')}>{t.controllerSearch}</a>
						</li>
						<li><hr class="dropdown-divider d-md-none" /></li>
						<li><span class="dropdown-item-text">{t.email}:<br />{prihlasenyEmail}</span></li>
						<li><span class="dropdown-item-text">{t.responsiblePerson}:<br />{osoba}</span></li>
						<li><hr class="dropdown-divider" /></li>
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
		{:else}
			<div class="ms-auto">
				<LanguageSelector />
			</div>
			<div class="d-flex flex-row">
				{#if !$page.route.id?.endsWith('login')}
					<a
						href={$relUrl(`/login?redirect=${$page.url.searchParams.get('redirect') ?? '/'}`)}
						class="btn btn-info ms-2">{t.toLogIn}</a
					>
				{/if}
				{#if !$page.route.id?.endsWith('signup')}
					<a
						href={$relUrl(`/signup?redirect=${$page.url.searchParams.get('redirect') ?? '/'}`)}
						class="btn btn-success ms-2">{t.toSignUp}</a
					>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<style>
	.gray {
		background-color: lightgray;
	}
	@media (prefers-color-scheme: dark) {
		.gray {
			background-color: dimgray;
		}
	}
</style>
