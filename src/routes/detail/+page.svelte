<script lang="ts">
	import { odstranitEvidenci, evidence } from '$lib/firebase';
	import { onMount } from 'svelte';
	// import { readFile } from 'fs/promises';
	import { type RawData } from '$lib/Vec';
	import { page } from '$app/stores';

	export let data: { id: string; user: string };

	let nacita = true;
	let existuje: boolean;
	let veci: RawData;

	onMount(async () => {
		let snapshot;
		try {
			snapshot = await evidence(data.user, data.id);
		} catch {
			console.log('Nepovedlo se načíst data z firebase');
			existuje = false;
			nacita = false;
			return;
		}

		existuje = snapshot.exists();
		nacita = false;
		if (!existuje) return;

		veci = snapshot.data() as RawData;
	});

	// const downloadPdf1 = async () => {
	// window.location.href = $page.url.href.replace("/detail?", "/detail/Formulář RegulusRoute.pdf?")
	// };

	const remove = async () => {
		await odstranitEvidenci(data.user, data.id);
	};

	const copyLink = async () => {
		navigator.clipboard.writeText($page.url.href);
	};
</script>

<main class="my-3 container">
	<h1>Podrobnosti o evidenci</h1>

	{#if nacita}
		<div class="d-flex justify-content-start align-items-center">
			<div class="spinner-border me-2" />
			<span>Načítání dat...</span>
		</div>
	{:else if !existuje}
		<p class="mt-2">Omlouváme se, něco se nepovedlo.</p>
		<p class="mt-2">
			Buď je odkaz na tuto stránku nesprávný, nebo je již záznam o evidenci odstraněný.
		</p>
	{:else}
		<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
			<span>Odkaz na tuto stránku</span>
			<button class="btn btn-outline-primary ms-md-2 mt-2 mt-md-0" on:click={copyLink}
				>Kopírovat</button
			>
		</div>
		<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
			<span>Předvyplněný formulář o zpřístupění regulátoru službě IR RegulusRoute</span>
			<a
				class="btn btn-outline-primary ms-md-2 mt-2 mt-md-0"
				href={`/detail/Formulář RegulusRoute.pdf?user=${data.user}&id=${data.id}`}
				target="_blank">Otevřít (pdf)</a
			>
			<!-- <button class="btn btn-outline-primary ms-md-2 mt-2 mt-md-0" on:click={downloadPdf1}
				>Stáhnout (pdf)</button
			> -->
		</div>
		<button class="btn btn-outline-danger mt-2" on:click={remove}
			>Odstranit tento záznam evidence</button
		>
		<p class="mt-2">{JSON.stringify(veci)}</p>
	{/if}
</main>
