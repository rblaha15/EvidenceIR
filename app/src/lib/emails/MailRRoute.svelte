<script lang="ts">
	import type { RawData } from '$lib/Data';

	export let data: RawData;

	const typZarizeni = (data: RawData): string => {
		if (data.ir.typ.first.includes('BOX')) return 'CP-2972';
		if (data.ir.typ.first.includes('12')) return 'CP-1054';
		if (data.ir.typ.first.includes('14')) return 'CP-2007';
		return '???';
	};
	const zarizeni = (data: RawData): string => {
		if (data.ir.typ.first.includes('BOX'))
			return `${data.ir.typ.first} ${data.ir.typ.second} ${data.ir.cislo}`;
		return `${data.ir.typ.first.replaceAll(' ', '')} ${data.ir.typ.second} ${data.ir.cislo}`;
	};

	export let montazka: string | null;
	export let uvadec: string | null;
</script>

<h1>Regulátor</h1>
<p><b>Typ zařízení:</b> {typZarizeni(data)}</p>
<p><b>Výrobní číslo:</b> {data.ir.cislo}</p>
<p><b>Přihlášení:</b> {zarizeni(data)}</p>
<p>
	<b>Poznámka:</b>
	{data.koncovyUzivatel.prijmeni} {data.koncovyUzivatel.jmeno} - {data.mistoRealizace.obec}
</p>
<h2>Zodpovědná osoba:</h2>
<p>{data.ostatni.zodpovednaOsoba}</p>
<h2>Adresa:</h2>
<p><b>Město:</b> {data.mistoRealizace.obec}</p>
<p><b>Ulice:</b> {data.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {data.mistoRealizace.psc}</p>

{#if data.vzdalenyPristup.chce}
	<h2>Vzdálený přístup</h2>
	<p>K regulátoru chce mít přístup {data.vzdalenyPristup.pristupMa.join(', ')}</p>
	<p>Vzdálený přístup bude fakturovat {data.vzdalenyPristup.fakturuje}</p>
{/if}

<h1>Uživatel</h1>
<p><b>Jméno:</b> {data.koncovyUzivatel.jmeno}</p>
<p><b>Příjmení:</b> {data.koncovyUzivatel.prijmeni}</p>
<p><b>Přihlášení:</b> {data.koncovyUzivatel.email}</p>
<p><b>Heslo:</b> RegulusRoute1</p>
<p><b>Telefon:</b> {data.koncovyUzivatel.telefon}</p>
<p><b>Email:</b> {data.koncovyUzivatel.email}</p>

<h1>Montážní firma</h1>
{#if montazka != null}
	<p><b>Název:</b> {montazka}</p>
{/if}
<p><b>IČO:</b> {data.montazka.ico}</p>

<h1>Uvedení do provozu</h1>
{#if uvadec != null}
	<p><b>Název:</b> {uvadec}</p>
{/if}
<p><b>IČO:</b> {data.uvedeni.ico}</p>

<h1>Poznámka</h1>
<p>{data.ostatni.poznamka}</p>
