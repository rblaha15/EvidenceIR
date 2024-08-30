<script lang="ts">
	import { nazevIR, type RawData } from '$lib/Data';
	import type { TranslationReference, Translations } from '$lib/translations';
	import type { Pair } from '$lib/Vec';

	export let e: RawData;
	export let t: Translations;

	const typZarizeni = (e: RawData): string => {
		if (e.ir.typ.first!.includes('BOX')) return 'CP-2972';
		if (e.ir.typ.first!.includes('12')) return 'CP-1054';
		if (e.ir.typ.first!.includes('14')) return 'CP-2007';
		return '???';
	};

	export let montazka: string | null;
	export let uvadec: string | null;
</script>

<p>Prosím o založení RegulusRoutu k tomuto regulátoru:</p>

<h1>Regulátor</h1>
<p><b>Typ zařízení:</b> {typZarizeni(e)}</p>
<p><b>Výrobní číslo:</b> {e.ir.cislo}</p>
<p><b>Přihlášení:</b> {nazevIR(t, e.ir.typ)} {e.ir.cislo}</p>
<p>
	<b>Poznámka:</b>
	{e.koncovyUzivatel.prijmeni}
	{e.koncovyUzivatel.jmeno} - {e.mistoRealizace.obec}
</p>
<h2>Zodpovědná osoba:</h2>
<p>{e.ostatni.zodpovednaOsoba}</p>
<h2>Adresa:</h2>
<p><b>Město:</b> {e.mistoRealizace.obec}</p>
<p><b>Ulice:</b> {e.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {e.mistoRealizace.psc}</p>

<h2>Vzdálený přístup</h2>
<p>K regulátoru chce mít přístup {e.vzdalenyPristup.pristupMa.map((a) => t.get(a)).join(', ')}</p>
<p>Vzdálený přístup bude fakturovat {t.getN(e.vzdalenyPristup.fakturuje)}</p>

<h1>Uživatel</h1>
<p><b>Jméno:</b> {e.koncovyUzivatel.jmeno}</p>
<p><b>Příjmení:</b> {e.koncovyUzivatel.prijmeni}</p>
<p><b>Přihlášení:</b> {e.koncovyUzivatel.email}</p>
<p><b>Heslo:</b> Regulusroute1</p>
<p><b>Telefon:</b> {e.koncovyUzivatel.telefon}</p>
<p><b>Email:</b> {e.koncovyUzivatel.email}</p>

<h1>Montážní firma</h1>
{#if montazka != null}
	<p><b>Název:</b> {montazka}</p>
{/if}
<p><b>IČO:</b> {e.montazka.ico}</p>

<h1>Uvedení do provozu</h1>
{#if uvadec != null}
	<p><b>Název:</b> {uvadec}</p>
{/if}
<p><b>IČO:</b> {e.uvedeni.ico}</p>

<h1>Poznámka</h1>
<p>{e.ostatni.poznamka}</p>
