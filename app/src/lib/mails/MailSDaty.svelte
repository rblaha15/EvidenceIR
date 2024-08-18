<script lang="ts">
		import type { Data } from "$lib/Data";

	export let data: Data;

	const { ir, koncovyUzivatel: koncak, montazka, mistoRealizace: misto, tc, uvedeni } = data;
</script>

<h1>Regulátor</h1>
<p><b>Typ:</b> {ir.typ.vybrano}</p>
<p><b>Sériové číslo:</b> {ir.cislo.text}</p>

<h1>Tepelné čerpadlo</h1>
{#if tc.druh.zobrazit}
	<p><b>Druh:</b> {tc.druh.vybrano}</p>
{/if}
<p><b>Typ:</b> {tc.typ.vybrano}</p>
<p><b>Výrobní číslo:</b> {tc.cislo.text}</p>

<h1>Koncový uživatel</h1>
<p><b>Jméno:</b> {koncak.jmeno.text}</p>
<p><b>Příjmení:</b> {koncak.prijmeni.text}</p>
<p><b>Datum narození:</b> {koncak.narozeni.text}</p>
<p><b>Telefon:</b> {koncak.telefon.text}</p>
<p><b>Email:</b> {koncak.email.text}</p>

<h2>Adresa:</h2>
<p><b>Obec:</b> {misto.obec.text}</p>
<p><b>Číslo popisné nebo ulice a číslo orientační:</b> {misto.ulice.text}</p>
<p><b>PSČ:</b> {misto.psc.text}</p>

<h1>Montážní firma</h1>
<p><b>IČO:</b> {montazka.ico.text}</p>
<p><b>Zástupce:</b> {montazka.zastupce.text}</p>
<p><b>Email:</b> {montazka.email.text}</p>

<h1>Uvedení do provozu</h1>
<p><b>IČO:</b> {uvedeni.ico.text}</p>
<p><b>Zástupce:</b> {uvedeni.zastupce.text}</p>
<p><b>Email:</b> {uvedeni.email.text}</p>
