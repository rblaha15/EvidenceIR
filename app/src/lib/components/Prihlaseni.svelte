<script lang="ts">
	import { page } from '$app/stores';
	import { relUrl } from '$lib/constants';
	import { jeAdmin, odhlasit, prihlasenState, zodpovednaOsoba } from '$lib/firebase';
	import type { Translations } from '$lib/translations';
	import LanguageSelector from './LanguageSelector.svelte';

	export let t: Translations

	$: prihlasenyEmail = ($prihlasenState == 'null' ? null : $prihlasenState)?.email ?? '';
	$: osoba = $zodpovednaOsoba ?? t.no_Person;
	$: jePrihlasen = prihlasenyEmail != '';
</script>

<div
	class="d-flex flex-column flex-lg-row align-items-start align-items-md-end align-items-lg-center"
>
	<LanguageSelector />
	{#if jePrihlasen}
		<div class="d-flex flex-column align-items-start align-items-md-end ms-lg-2 mt-2 mt-lg-0">
			<span>{prihlasenyEmail}</span>
			<span>{t.responsiblePerson}: {osoba}</span>
		</div>
		<button class="btn btn-outline-danger mt-2 mt-lg-0 ms-lg-2" on:click={odhlasit}>{t.toLogOut}</button>
	{:else}
		<a href={$relUrl("/login")} class="btn btn-success mt-2 mt-lg-0 ms-lg-2">{t.toLogIn}</a>
	{/if}
	{#if $jeAdmin && !$page.route.id?.endsWith("admin")}
		<a href={$relUrl("/admin")} class="btn btn-outline-secondary mt-2 mt-lg-0 ms-lg-2">Upravit seznam lidí</a>
	{/if}
</div>
