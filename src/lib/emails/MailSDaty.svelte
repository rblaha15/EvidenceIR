<script lang="ts">
	import type { RawData } from '$lib/Data';

	export let data: RawData;
</script>

<h1>TADY CHYBÍ NĚJAKÁ POLE</h1>

<h1>Regulátor</h1>
<p><b>Typ:</b> {data.ir.typ.first} {data.ir.typ.second}</p>
<p><b>Sériové číslo:</b> {data.ir.cislo}</p>

<h1>Tepelné čerpadlo</h1>
{#if data.ir.typ.second == 'CTC'}
	<p><b>Druh:</b> {data.tc.druh}</p>
{/if}
<p><b>Typ:</b> {data.tc.typ}</p>
<p><b>Výrobní číslo:</b> {data.tc.cislo}</p>

<h1>Koncový uživatel</h1>
<p><b>Jméno:</b> {data.koncovyUzivatel.jmeno}</p>
<p><b>Příjmení:</b> {data.koncovyUzivatel.prijmeni}</p>
<p><b>Datum narození:</b> {data.koncovyUzivatel.narozeni}</p>
<p><b>Telefon:</b> {data.koncovyUzivatel.telefon}</p>
<p><b>Email:</b> {data.koncovyUzivatel.email}</p>

<h2>Adresa:</h2>
<p><b>Obec:</b> {data.mistoRealizace.obec}</p>
<p><b>Číslo popisné nebo ulice a číslo orientační:</b> {data.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {data.mistoRealizace.psc}</p>

<h1>Montážní firma</h1>
<p><b>IČO:</b> {data.montazka.ico}</p>
<p><b>Zástupce:</b> {data.montazka.zastupce}</p>
<p><b>Email:</b> {data.montazka.email}</p>

<h1>Uvedení do provozu</h1>
<p><b>IČO:</b> {data.uvedeni.ico}</p>
<p><b>Zástupce:</b> {data.uvedeni.zastupce}</p>
<p><b>Email:</b> {data.uvedeni.email}</p>
