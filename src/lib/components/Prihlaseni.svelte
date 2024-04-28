<script lang="ts">
	import { page } from '$app/stores';
	import { jeAdmin, odhlasit, prihlasenState, zodpovednaOsoba } from '$lib/firebase';

	$: prihlasenyEmail = ($prihlasenState == 'null' ? null : $prihlasenState)?.email ?? '';
	$: osoba = $zodpovednaOsoba ?? 'Žádná';
	$: jePrihlasen = prihlasenyEmail != '';
</script>

<div
	class="d-flex flex-column flex-lg-row align-items-start align-items-md-end align-items-lg-center"
>
	{#if jePrihlasen}
		<div class="d-flex flex-column align-items-start align-items-md-end">
			<span>{prihlasenyEmail}</span>
			<span>Zodpovědná osoba: {osoba}</span>
		</div>
		<button class="btn btn-outline-danger mt-2 mt-lg-0 ms-lg-2" on:click={odhlasit}>Odhlásit se</button>
	{:else}
		<a href="/login" class="btn btn-success mt-2 mt-lg-0 ms-lg-2">Přihlásit se</a>
	{/if}
	{#if $jeAdmin && $page.route.id != '/admin'}
		<a href="/admin" class="btn btn-outline-secondary mt-2 mt-lg-0 ms-lg-2">Upravit seznam lidí</a>
	{/if}
</div>
