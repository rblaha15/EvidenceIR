<script lang="ts">
	import { getToken, isAdmin, prihlasenState } from '$lib/client/auth';
	import { seznamLidi, type Person } from '$lib/client/realtime';
	import Navigation from '$lib/components/Navigation.svelte';
	import cs from '$lib/translations/cs';
	import { diffLines, type Change } from 'diff';
	import download from 'downloadjs';
	import { onMount } from 'svelte';

	let nacita = true;
	onMount(() => (nacita = false));

	let loading = false;

	const poVybrani = (
		ev: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const file = ev.currentTarget.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = async (evt) => {
				const text = evt.target?.result as string | null;
				newData = text ?? '';
			};
		}
	};

	const stahnout = () => {
		download(new File([oldData], 'lidi.csv'), 'lidi.csv', 'text/csv');
	};

	const potvrdit = async () => {
		loading = true;

		const token = await getToken();

		await fetch(`/api/aktualizovatLidi?token=${token}`, {
			method: 'POST',
			body: JSON.stringify({
				lidi: newData
					.split('\n')
					.filter((radek) => radek != '')
					.map((radek) => radek.split(';').filter((vec) => vec != ''))
					.map(([email, montazky, uvadeci, osoba]) => ({
						email,
						assembly: montazky.split('#').filter((vec) => vec != ''),
						commissioning: uvadeci.split('#').filter((vec) => vec != ''),
						responsible: osoba
					}))
					.map(({ assembly, commissioning, email, responsible }) => ({
						email,
						assemblyCompanies: Object.fromEntries(assembly.map((crn) => [crn, crn])),
						commissioningCompanies: Object.fromEntries(commissioning.map((crn) => [crn, crn])),
						responsiblePerson: responsible
					})) as Person[]
			})
		});
		loading = false;
		newData = '';
	};

	$: textovySeznam = $seznamLidi.map(
		({ email, assemblyCompanies, commissioningCompanies, responsiblePerson }) =>
			`${email};${Object.values(assemblyCompanies).join('#')};${Object.values(commissioningCompanies).join('#')};${responsiblePerson ?? ''}`.trim()
	);

	$: oldData = textovySeznam.join('\n');
	let newData = '';
	$: diff = diffLines(oldData.trim(), newData.trim()) as Change[];
	$: onlyDiff = diff.filter((part) => part.added || part.removed);
</script>

{#if $prihlasenState == 'null' || nacita}
	<div class="spinner-border text-danger" />
{:else if $isAdmin}
	<Navigation t={cs} />
	<main class="container my-3">
		<h1>Seznam uživatelů a příslušných firem</h1>
		<p class="mt-3 mb-0">
			Vložte .csv soubor oddělený středníky (;), kde v prvním sloupci je email, v druhém sloupci iča
			montážních firem oddělená hashy (#), v třetím slopci jsou stejně oddělená iča uvaděčů a ve
			čtvrtém spoupci jméno odpovědné osoby: <br />
			Př.: email@example.com;12345678#87654321;14725836#63852741;Jan Novák
		</p>

		<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
			{#if loading}
				<div class="d-flex align-items-center">
					<span>Odesílání dat</span>
					<div class="spinner-border text-danger ms-2" />
				</div>
			{:else if newData == ''}
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => document.getElementById('file')?.click()}
				>
					Vybrat soubor
				</button>
			{:else}
				<button type="button" class="btn btn-danger" on:click={potvrdit}> Potvrdit změny </button>
				<button
					type="button"
					class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
					on:click={() => document.getElementById('file')?.click()}
				>
					Vybrat jiný soubor
				</button>
			{/if}
			<button
				type="button"
				class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
				on:click={stahnout}
			>
				Stáhnout aktuální data
			</button>
			<button
				type="button"
				class="btn btn-outline-secondary mt-2 ms-md-2 mt-md-0"
				on:click={() => history.back()}
			>
				Zpět
			</button>
		</div>

		{#if newData != '' && !loading}
			<h4 class="mt-3">Změny, které se chystáte provést:</h4>
			<p>
				{#each onlyDiff as part}
					{part.added ? '+' : part.removed ? '-' : ''}
					<span style="color: {part.added ? 'green' : part.removed ? 'red' : ''};">
						{@html part.value.replaceAll('\n', '<br />')}
					</span>
				{/each}
			</p>
			{#if onlyDiff.length == 0}
				<p>Žádné změny</p>
			{/if}
		{/if}

		<div class="mt-3">
			<h4>Aktuálně uložená data:</h4>
			{#each textovySeznam as clovek}
				<span>{clovek}</span> <br />
			{/each}
		</div>

		<input style="display: none;" id="file" type="file" accept="text/csv" on:change={poVybrani} />
	</main>
{:else}
	<div class="d-flex flex-column flex-md-row align-items-start">
		<div class="flex-grow-1">
			<h1>401</h1>
			<p>Unautorized</p>
		</div>
	</div>
{/if}
