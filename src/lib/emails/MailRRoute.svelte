<script lang="ts">
	import { type Data } from '$lib/forms/Data';
	import type { Translations } from '$lib/translations';
    import { irName, irLabel } from '$lib/helpers/ir';
	import type { Raw } from '$lib/forms/Form';
	import { extractIRIDFromParts } from '$lib/client/firestore';

	const typZarizeni = (e: Raw<Data>): string => {
		if (e.ir.typ.first!.includes('BOX')) return 'CP-2972';
		if (e.ir.typ.first!.includes('12')) return 'CP-1054';
		if (e.ir.typ.first!.includes('14')) return 'CP-2007';
        if (e.ir.typ.first!.includes('34')) return 'CP-2007';
		return '???';
	};

	interface Props {
		e: Raw<Data>;
		t: Translations;
		montazka: string | null;
		uvadec: string | null;
        origin: string;
	}

	let {
		e,
		t,
		montazka,
		uvadec,
        origin,
	}: Props = $props();

    const irid = extractIRIDFromParts(e.ir.typ.first!, e.ir.cislo);
</script>

<p>Prosím o založení RegulusRoutu k tomuto regulátoru:</p>

<h2>Regulátor</h2>
<p><b>Typ zařízení:</b> {typZarizeni(e)}</p>
{#if !e.ir.typ.first?.includes('SOREL')}
	<p><b>Výrobní číslo:</b> {e.ir.cislo}</p>
{/if}
<p><b>Přihlášení:</b> {irName(e.ir)}</p>
<p><b>Poznámka:</b> {irLabel(e)}</p>
<h3>Zodpovědná osoba:</h3>
<p>{e.ostatni.zodpovednaOsoba}</p>
<h3>Adresa:</h3>
<p><b>Město:</b> {e.mistoRealizace.obec}</p>
<p><b>Ulice:</b> {e.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {e.mistoRealizace.psc}</p>

<h3>Vzdálený přístup</h3>
<p>K regulátoru chce mít přístup {e.vzdalenyPristup.pristupMa.map((a) => t.get(a).toLowerCase()).join(', ')}</p>
<p>Vzdálený přístup zaplatí {t.get(e.vzdalenyPristup.plati)?.toLowerCase() ?? ''}</p>

<h2>Uživatel</h2>
{#if e.koncovyUzivatel.typ === `individual`}
	<p><b>Jméno:</b> {e.koncovyUzivatel.jmeno}</p>
	<p><b>Příjmení:</b> {e.koncovyUzivatel.prijmeni}</p>
{/if}
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
<p><b>Email:</b> {e.montazka.email}</p>
<p><b>Telefon:</b> {e.montazka.telefon}</p>

<h2>Uvedení do provozu</h2>
{#if uvadec != null}
	<p><b>Název:</b> {uvadec}</p>
{/if}
<p><b>IČO:</b> {e.uvedeni.ico}</p>
<p><b>Zástupce:</b> {e.uvedeni.zastupce}</p>
<p><b>Email:</b> {e.uvedeni.email}</p>
<p><b>Telefon:</b> {e.uvedeni.telefon}</p>

<h2>Poznámka</h2>
<p>{e.ostatni.poznamka}</p>

<p>Odkaz na podrobnosti evidence: <a href={origin + `/detail/${irid}`}>{origin + `/detail/${irid}`}</a></p>