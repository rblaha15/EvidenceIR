<script lang="ts">
	import { nazevIR, type RawData } from '$lib/Data';
	import type { Translations } from '$lib/translations';

	const typZarizeni = (e: RawData): string => {
		if (e.ir.typ.first!.includes('BOX')) return 'CP-2972';
		if (e.ir.typ.first!.includes('12')) return 'CP-1054';
		if (e.ir.typ.first!.includes('14')) return 'CP-2007';
		return '???';
	};

	interface Props {
		e: RawData;
		t: Translations;
		montazka: string | null;
		uvadec: string | null;
	}

	let {
		e,
		t,
		montazka,
		uvadec
	}: Props = $props();
</script>

<p>Prosím o založení RegulusRoutu k tomuto regulátoru:</p>

<h2>Regulátor</h2>
<p><b>Typ zařízení:</b> {typZarizeni(e)}</p>
<p><b>Výrobní číslo:</b> {e.ir.cislo}</p>
<p><b>Přihlášení:</b> {nazevIR(t, e.ir.typ)} {e.ir.cislo}</p>
<p>
	<b>Poznámka:</b>
	{e.koncovyUzivatel.prijmeni}
	{e.koncovyUzivatel.jmeno} - {e.mistoRealizace.obec}
</p>
<h3>Zodpovědná osoba:</h3>
<p>{e.ostatni.zodpovednaOsoba}</p>
<h3>Adresa:</h3>
<p><b>Město:</b> {e.mistoRealizace.obec}</p>
<p><b>Ulice:</b> {e.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {e.mistoRealizace.psc}</p>

<h3>Vzdálený přístup</h3>
<p>K regulátoru chce mít přístup {e.vzdalenyPristup.pristupMa.map((a) => t.get(a)).join(', ')}</p>
<p>Vzdálený přístup bude fakturovat {t.getN(e.vzdalenyPristup.fakturuje)}</p>

<h2>Uživatel</h2>
<p><b>Jméno:</b> {e.koncovyUzivatel.jmeno}</p>
<p><b>Příjmení:</b> {e.koncovyUzivatel.prijmeni}</p>
<p><b>Přihlášení:</b> {e.koncovyUzivatel.email}</p>
<p><b>Heslo:</b> Regulusroute1</p>
<p><b>Telefon:</b> {e.koncovyUzivatel.telefon}</p>
<p><b>Email:</b> {e.koncovyUzivatel.email}</p>

<h2>Montážní firma</h2>
{#if montazka != null}
	<p><b>Název:</b> {montazka}</p>
{/if}
<p><b>IČO:</b> {e.montazka.ico}</p>
<p><b>Zástupce:</b> {e.montazka.zastupce}</p>

<h2>Uvedení do provozu</h2>
{#if uvadec != null}
	<p><b>Název:</b> {uvadec}</p>
{/if}
<p><b>IČO:</b> {e.uvedeni.ico}</p>
<p><b>Zástupce:</b> {e.uvedeni.zastupce}</p>

<h2>Poznámka</h2>
<p>{e.ostatni.poznamka}</p>
