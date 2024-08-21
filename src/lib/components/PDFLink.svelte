<script lang="ts">
	import { languageCodes, type LanguageCode } from '$lib/languages';
	import { languageNames, type Translations } from '$lib/translations';
	import { onMount } from 'svelte';
	import type { PageData } from '../../routes/[[lang]]/detail/[ir]/$types';
	import { getToken } from '$lib/client/auth';

	export let linkName: string;
	export let name: string;
	export let data: PageData;
	export let t: Translations;

	const open = async (lang: LanguageCode) => {
		const token = await getToken();
		window.open(`/${lang}/detail/${data.ir}/${linkName}?token=${token}`);
	};
</script>

<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
	<span>{name}</span>

	<div class="btn-group ms-sm-2 mt-2 mt-sm-0">
		<button
			on:click={() => open(data.languageCode)}
			type="button"
			class="btn btn-outline-primary text-nowrap">{t.openPdf}</button
		>
		<button type="button" class="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
			<span>{data.languageCode.toUpperCase()}</span>
		</button>
		<ul class="dropdown-menu">
			{#each languageCodes as code}
				<li>
					<button
						on:click={() => open(code)}
						type="button"
						class="btn btn-outline-primary text-nowrap dropdown-item"
					>
						<span class="fs-5">{code.toUpperCase()}</span>
						{languageNames[code]}
					</button>	
				</li>
			{/each}
		</ul>
	</div>
</div>
