<script lang="ts">
		import type { Data } from "$lib/Data";

	export let data: Data;

	const typZarizeni = (data: { ir: { typ: { vybrano: string } } }): string => {
		if (data.ir.typ.vybrano.includes('12')) return 'CP-1054';
		if (data.ir.typ.vybrano.includes('14')) return 'CP-2007';
		if (data.ir.typ.vybrano.includes('RegulusBOX')) return 'CP-2972';
		return '???';
	};
	const zarizeni = (data: {
		ir: { typ: { vybrano: string }; cislo: { text: string } };
	}): string => {
		if (data.ir.typ.vybrano.includes('RegulusBOX'))
			return `${data.ir.typ.vybrano} ${data.ir.cislo.text}`;
		return `${data.ir.typ.vybrano.replaceAll(' ', '')} ${data.ir.cislo.text}`;
	};

	export let montazka: string | null;
	export let uvadec: string | null;
</script>

<h1>Regulátor</h1>
<p><b>Typ zařízení:</b> {typZarizeni(data)}</p>
<p><b>Výrobní číslo:</b> {data.ir.cislo.text}</p>
<p><b>Přihlášení:</b> {zarizeni(data)}</p>
<p>
	<b>Poznámka:</b>
	{data.koncovyUzivatel.prijmeni.text}, {data.koncovyUzivatel.jmeno.text} - {data.mistoRealizace
		.obec.text}
</p>
<h2>Zodpovědná osoba:</h2>
<p>{data.zodpovednaOsoba.jmeno.text}</p>
<h2>Adresa:</h2>
<p><b>Město:</b> {data.mistoRealizace.obec.text}</p>
<p><b>Ulice:</b> {data.mistoRealizace.ulice.text}</p>
<p><b>PSČ:</b> {data.mistoRealizace.psc.text}</p>

{#if data.vzdalenyPristup.chce.zaskrtnuto}
	<h2>Vzdálený přístup</h2>
	<p>K regulátoru chce mít přístup {data.vzdalenyPristup.pristupMa.vybrano.join(', ')}</p>
	<p>Vzdálený přístup bude fakturovat {data.vzdalenyPristup.fakturuje.vybrano}</p>
{/if}

<h1>Uživatel</h1>
<p><b>Jméno:</b> {data.koncovyUzivatel.jmeno.text}</p>
<p><b>Příjmení:</b> {data.koncovyUzivatel.prijmeni.text}</p>
<p><b>Přihlášení:</b> {data.koncovyUzivatel.email.text}</p>
<p><b>Heslo:</b> RegulusRoute1</p>
<p><b>Telefon:</b> {data.koncovyUzivatel.telefon.text}</p>
<p><b>Email:</b> {data.koncovyUzivatel.email.text}</p>

<h1>Montážní firma</h1>
{#if montazka != null}
	<p><b>Název:</b> {montazka}</p>
{/if}
<p><b>IČO:</b> {data.montazka.ico.text}</p>

<h1>Uvedení do provozu</h1>
{#if uvadec != null}
	<p><b>Název:</b> {uvadec}</p>
{/if}
<p><b>IČO:</b> {data.uvedeni.ico.text}</p>
