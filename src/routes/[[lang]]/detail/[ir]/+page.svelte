<script lang="ts">
	import { odstranitEvidenci, evidence } from '$lib/firebase';
	import { onMount } from 'svelte';
	import { type RawData } from '$lib/Data';
	import { page } from '$app/stores';
	import type { FirebaseError } from 'firebase/app';
	import type { PageData } from './$types';
	import { languageCodes, type LanguageCode } from '$lib/languages';
	import { languageNames } from '$lib/translations';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	export let data: PageData;

	const t = data.translations;

	let nacita = true;
	let existuje: boolean;
	let error = '';
	let veci: RawData;

	onMount(async () => {
		let snapshot;
		try {
			snapshot = await evidence(data.ir);
		} catch (e) {
			console.log('Nepovedlo se načíst data z firebase');
			error = (e as FirebaseError).name;
			existuje = false;
			nacita = false;
			return;
		}

		const ir = snapshot.data();
		nacita = false;
		if (!snapshot.exists() || ir == undefined) {
			existuje = false;
			return;
		}

		veci = ir.evidence;
		console.log(veci);
	});

	const remove = async () => {
		await odstranitEvidenci(data.ir);
	};

	const copyLink = async () => {
		navigator.clipboard.writeText($page.url.href);
	};

	let formLang: LanguageCode = data.languageCode;
</script>

<main class="my-3 container">
	<div class="d-flex flex-column flex-md-row">
		<h1>{t.evidenceDetails}</h1>

		<div class="d-flex flex-grow-1 flex-row-reverse flex-md-row justify-content-end">
			<LanguageSelector />
		</div>
	</div>

	{#if nacita}
		<div class="d-flex justify-content-start align-items-center">
			<div class="spinner-border me-2" />
			<span></span>
		</div>
	{:else if error}
		<p class="mt-2">{t.sorrySomethingWentWrong}</p>
	{:else if !existuje}
		<p class="mt-2">{t.sorrySomethingWentWrong}</p>
		<p class="mt-2">{t.linkInvalid}</p>
	{:else}
		<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
			<span>{t.linkToThis}</span>
			<button class="btn btn-outline-primary ms-md-2 mt-2 mt-md-0" on:click={copyLink}
				>{t.copy}</button
			>
		</div>

		<div
			class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2 flex-grow-1"
		>
			<span>{t.regulusRouteForm}</span>
			<a
				class="btn btn-outline-primary ms-md-2 mt-2 mt-md-0"
				href={`/${formLang}/detail/${data.ir}/rroute`}
				target="_blank">{t.openPdf} ({formLang})</a
			>
			<div class="dropdown">
				<button type="button" class="btn btn-link dropdown-toggle" data-bs-toggle="dropdown">
					{t.changeLang}
				</button>
				<ul class="dropdown-menu">
					{#each languageCodes as code}
						<li>
							<button class="dropdown-item" on:click={() => (formLang = code)}>
								{languageNames[code]}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<button class="btn btn-outline-danger mt-2" on:click={remove}>{t.deleteThisEvidence}</button>
	{/if}
</main>
