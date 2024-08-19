<script lang="ts">
	import Prihlaseni from '$lib/components/Prihlaseni.svelte';
	import { jeAdmin, prihlasenState, seznamLidi } from '$lib/firebase';
	import cs from '$lib/translations/cs';
	import en from '$lib/translations/en';
	import { diffLines, type Change } from 'diff';
	import download from 'downloadjs';

	let loading = false

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
		download(new File([oldData], 'firmy.csv'), 'firmy.csv', 'text/csv');
	};

	const potvrdit = async () => {
		loading = true
		await fetch(`/api/aktualizovatLidi`, {
			method: 'POST',
			body: JSON.stringify({
				lidi: newData
					.split('\n')
					.filter((radek) => radek != '')
					.map((radek) => radek.split(';').filter((vec) => vec != ''))
					.map(
						([email, montazky, uvadeci, osoba]) =>
							[
								email,
								montazky.split('#').filter((vec) => vec != ''),
								uvadeci.split('#').filter((vec) => vec != ''),
								osoba
							] as [string, string[], string[], string]
					)
					.map(([email, montazky, uvadeci, osoba]) => [
						email,
						Object.fromEntries(montazky.map((ico) => [ico, ico])),
						Object.fromEntries(uvadeci.map((ico) => [ico, ico])),
						osoba
					])
			})
		});
		loading = false
		newData = '';
	};

	$: textovySeznam = $seznamLidi.map(([email, montazky, uvadeci, osoba]) =>
		`${email};${Object.values(montazky).join('#')};${Object.values(uvadeci).join('#')};${osoba ?? ''}`.trim()
	);

	$: oldData = textovySeznam.join('\n');
	let newData = '';
	$: diff = diffLines(oldData.trim(), newData.trim()) as Change[];
	$: onlyDiff = diff.filter((part) => part.added || part.removed);
</script>

<div class="container my-3">
	{#if $prihlasenState == 'null'}
		<div class="spinner-border text-danger" />
	{:else if $jeAdmin}
		<div class="d-flex flex-column flex-md-row align-items-start">
			<h1 class="flex-grow-1">Seznam emailů a příslušných firem</h1>

			<Prihlaseni t={cs} />
		</div>

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
					<div class="spinner-border text-primary ms-2" />
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
				<button type="button" class="btn btn-danger" on:click={potvrdit}>
					Potvrdit změny
				</button>
				<button
					type="button"
					class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
					on:click={() => document.getElementById('file')?.click()}
				>
					Vybrat jiný soubor
				</button>
			{/if}
			<button type="button" class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0" on:click={stahnout}>
				Stáhnout aktuální data
			</button>
			<button type="button" class="btn btn-outline-secondary mt-2 ms-md-2 mt-md-0" on:click={() => history.back()}>
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
	{:else}
		<div class="d-flex flex-column flex-md-row align-items-start">
			<div class="flex-grow-1">
				<h1>401</h1>
				<p>Unautorized</p>
			</div>

			<Prihlaseni t={en} />
		</div>
	{/if}
</div>
