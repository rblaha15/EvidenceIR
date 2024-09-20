<script lang="ts">
	import { type LanguageCode } from '$lib/languages';
	import { languageNames, type Translations } from '$lib/translations';
	import type { PageData } from '../../routes/[[lang]]/(hasLayout)/(requiresLogin)/detail/[ir]/$types';
	import { getToken } from '$lib/client/auth';
	import { pdfData } from '$lib/client/pdf';
	import { type Pdf } from '$lib/client/pdf';
	import { storable } from '$lib/helpers/stores';
	import { getIsOnline } from '$lib/client/realtime';
	import { get } from 'svelte/store';

	export let linkName: Pdf;
	export let name: string;
	export let data: PageData;
	export let t: Translations;
	export let enabled: boolean = true;

	$: pdf = pdfData[linkName];
	$: defaultLanguage = pdf.supportedLanguages.includes(data.languageCode)
		? data.languageCode
		: pdf.supportedLanguages[0];

	const lastToken = storable(null as string | null, 'firebase-token');

	let offlineError = false;

	const open = async (lang: LanguageCode) => {
		offlineError = false;
		let token: string;
		if (getIsOnline()) {
			token = await getToken();
			lastToken.set(token);
		} else {
			const t = get(lastToken);
			if (t) {
				token = t;
			} else {
				offlineError = true;
				return;
			}
		}
		window.open(`/${lang}/detail/${data.ir}/pdf/${linkName}?token=${token}`);
	};
</script>

<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
	<span>{name}</span>

	{#if !offlineError}
		<div class="btn-group ms-sm-2 mt-2 mt-sm-0">
			<button
				on:click={() => open(defaultLanguage)}
				type="button"
				disabled={!enabled}
				class="btn btn-outline-info text-nowrap">{t.openPdf}</button
			>
			<button
				type="button"
				disabled={!enabled || pdf.supportedLanguages.length == 1}
				class="btn btn-outline-secondary"
				class:dropdown-toggle={pdf.supportedLanguages.length > 1}
				data-bs-toggle="dropdown"
			>
				<span>{defaultLanguage.toUpperCase()}</span>
			</button>
			{#if pdf.supportedLanguages.length > 1}
				<ul class="dropdown-menu">
					{#each pdf.supportedLanguages as code}
						<li>
							<button on:click={() => open(code)} type="button" class="dropdown-item">
								<span class="fs-5">{code.toUpperCase()}</span>
								{languageNames[code]}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<div class="ms-sm-2 mt-2 mt-sm-0">
			{t.offline}
		</div>
	{/if}
	<slot />
</div>
