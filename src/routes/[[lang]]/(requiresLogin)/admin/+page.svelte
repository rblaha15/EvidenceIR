<script lang="ts">
	import { getToken } from '$lib/client/auth';
	import {
		seznamFirmy,
		seznamLidi,
		startFirmyListening,
		startLidiListening,
		type Company,
		type Person
	} from '$lib/client/realtime';
	import download from 'downloadjs';
	import { onMount } from 'svelte';

	let nacita = true;
	onMount(async () => {
		nacita = false;
		await startLidiListening();
		await startFirmyListening();
	});

	let loading = false;

	const poVybraniPeople = (
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
				newDataPeople = text ?? '';
			};
		}
	};
	const poVybraniCompanies = (
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
				newDataCompanies = text ?? '';
			};
		}
	};

	const stahnoutPeople = () => {
		download(new File([oldDataPeople], 'lidi.csv'), 'lidi.csv', 'text/csv');
	};

	const potvrditPeople = async () => {
		loading = true;

		const token = await getToken();

		await fetch(`/api/aktualizovat?type=lidi&token=${token}`, {
			method: 'POST',
			body: JSON.stringify({
				people: newDataPeople
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
		newDataPeople = '';
	};

	const stahnoutCompanies = () => {
		download(new File([oldDataCompanies], 'firmy.csv'), 'firmy.csv', 'text/csv');
	};

	const potvrditCompanies = async () => {
		loading = true;

		const token = await getToken();

		await fetch(`/api/aktualizovat?type=firmy&token=${token}`, {
			method: 'POST',
			body: JSON.stringify({
				people: newDataCompanies
					.split('\n')
					.filter((radek) => radek != '')
					.map((radek) => radek.split(';').map((vec) => (vec != '' ? vec : undefined)))
					.map(([crn, companyName, email, phone, representative]) => ({
						crn,
						companyName,
						email,
						phone,
						representative
					})) as Company[]
			})
		});
		loading = false;
		newDataCompanies = '';
	};

	$: oldListPeople = $seznamLidi.map(
		({ email, assemblyCompanies, commissioningCompanies, responsiblePerson }) =>
			`${email};${Object.values(assemblyCompanies).join('#')};${Object.values(commissioningCompanies).join('#')};${responsiblePerson ?? ''}`.trim()
	);

	$: oldDataPeople = oldListPeople.join('\n');
	let newDataPeople = '';
	$: newListPeople = newDataPeople.split(/\n|\r\n/);
	$: removalsPeople = oldListPeople.filter((p) => p != '' && !newListPeople.some((p2) => p == p2));
	$: additionsPeople = newListPeople.filter((p) => p != '' && !oldListPeople.some((p2) => p == p2));

	$: oldListCompanies = $seznamFirmy
		.toSorted((a, b) => a.crn.localeCompare(b.crn))
		.map(({ crn, companyName, email, phone, representative }) =>
			`${crn};${companyName};${email ?? ''};${phone ?? ''};${representative ?? ''}`.trim()
		);

	$: oldDataCompanies = oldListCompanies.join('\n');
	let newDataCompanies = '';
	$: newListCompanies = newDataCompanies.split(/\n|\r\n/);
	$: removalsCompanies = oldListCompanies.filter(
		(p) => p != '' && !newListCompanies.some((p2) => p == p2)
	);
	$: additionsCompanies = newListCompanies.filter(
		(p) => p != '' && !oldListCompanies.some((p2) => p == p2)
	);
</script>

<h1>Admin</h1>

<ul class="nav nav-tabs" role="tablist">
	<li class="nav-item" role="presentation">
		<button
			class="nav-link active"
			id="people-tab"
			data-bs-toggle="tab"
			data-bs-target="#people-tab-pane"
			type="button"
			role="tab"
			aria-controls="people-tab-pane"
			aria-selected="true">Uživatelé</button
		>
	</li>
	<li class="nav-item" role="presentation">
		<button
			class="nav-link"
			id="companies-tab"
			data-bs-toggle="tab"
			data-bs-target="#companies-tab-pane"
			type="button"
			role="tab"
			aria-controls="companies-tab-pane"
			aria-selected="false">Firmy</button
		>
	</li>
</ul>
<div class="tab-content">
	<div
		class="tab-pane fade show active"
		id="people-tab-pane"
		role="tabpanel"
		aria-labelledby="people-tab"
		tabindex="0"
	>
		<h2>Seznam uživatelů a příslušných firem</h2>
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
			{:else if newDataPeople == ''}
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => document.getElementById('file-people')?.click()}
				>
					Vybrat soubor
				</button>
			{:else}
				<button type="button" class="btn btn-danger" on:click={potvrditPeople}>
					Potvrdit změny
				</button>
				<button
					type="button"
					class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
					on:click={() => (newDataPeople = '')}
				>
					Zrušit změny
				</button>
				<button
					type="button"
					class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
					on:click={() => document.getElementById('file-people')?.click()}
				>
					Vybrat jiný soubor
				</button>
			{/if}
			<button
				type="button"
				class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
				on:click={stahnoutPeople}
			>
				Stáhnout aktuální data
			</button>
		</div>

		{#if newDataPeople != '' && !loading}
			<h4 class="mt-3">Změny, které se chystáte provést:</h4>
			{#if additionsPeople.length == 0 && removalsPeople.length == 0}
				<p>Žádné změny</p>
			{/if}
			<p>
				{#each additionsPeople as addition}
					+<span class="text-success">{addition}</span> <br />
				{/each}
				{#each removalsPeople as removal}
					-<span class="text-danger">{removal}</span> <br />
				{/each}
			</p>
		{/if}

		<div class="mt-3">
			<h4>Aktuálně uložená data:</h4>
			{#each oldListPeople as clovek}
				<span>{clovek}</span> <br />
			{/each}
		</div>

		<input
			style="display: none;"
			id="file-people"
			type="file"
			accept="text/csv"
			on:change={poVybraniPeople}
		/>
	</div>
	<div
		class="tab-pane fade"
		id="companies-tab-pane"
		role="tabpanel"
		aria-labelledby="companies-tab"
		tabindex="0"
	>
		<h2>Seznam firem</h2>
		<p class="mt-3">
			Vložte .csv soubor oddělený středníky (;), kde každý řádek popisuje jednu montážní firmu nebo
			uvaděče.
		</p>
		<p>
			V případě FO: ičo;jméno;email;telefonní číslo;jméno (znovu) <br />
			Př.: 12345678;Jan Novák;jan.novak@seznam.cz;+420777666555;Jan Novák
		</p>
		<p>
			V případě PO: ičo;název firmy;email na firmu;telefonní číslo na firmu;jméno zástupce firmy <br
			/>
			Př.: 87654321;Topení Novák s.r.o.;info@novak.cz;+420765765765;Jan Novák
		</p>
		<p class="mb-0">Všechna pole kromě iča a názvu/jména osoby mohou být vynechána</p>

		<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
			{#if loading}
				<div class="d-flex align-items-center">
					<span>Odesílání dat</span>
					<div class="spinner-border text-danger ms-2" />
				</div>
			{:else if newDataCompanies == ''}
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => document.getElementById('file-companies')?.click()}
				>
					Vybrat soubor
				</button>
			{:else}
				<button type="button" class="btn btn-danger" on:click={potvrditCompanies}>
					Potvrdit změny
				</button>
				<button
					type="button"
					class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
					on:click={() => (newDataCompanies = '')}
				>
					Zrušit změny
				</button>
				<button
					type="button"
					class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
					on:click={() => document.getElementById('file-companies')?.click()}
				>
					Vybrat jiný soubor
				</button>
			{/if}
			<button
				type="button"
				class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
				on:click={stahnoutCompanies}
			>
				Stáhnout aktuální data
			</button>
		</div>

		{#if newDataCompanies != '' && !loading}
			<h4 class="mt-3">Změny, které se chystáte provést:</h4>
			{#if additionsCompanies.length == 0 && removalsCompanies.length == 0}
				<p>Žádné změny</p>
			{/if}
			<p>
				{#each additionsCompanies as addition}
					+<span class="text-success">{addition}</span> <br />
				{/each}
				{#each removalsCompanies as removal}
					-<span class="text-danger">{removal}</span> <br />
				{/each}
			</p>
		{/if}

		<div class="mt-3">
			<h4>Aktuálně uložená data:</h4>
			{#each oldListCompanies as clovek}
				<span>{clovek}</span> <br />
			{/each}
		</div>

		<input
			style="display: none;"
			id="file-companies"
			type="file"
			accept="text/csv"
			on:change={poVybraniCompanies}
		/>
	</div>
</div>
