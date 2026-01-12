<script lang="ts">
    import { type FormIN, type IRTypes } from '$lib/forms/IN/formIN';
    import { get, type Translations } from '$lib/translations';
    import { irName, irLabel, extractIRIDFromParts, endUserEmails } from '$lib/helpers/ir';
	import type { Raw } from '$lib/forms/Form';
	import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import type { User } from 'firebase/auth';

	interface Props {
		e: Raw<FormIN>;
		t: Translations;
		montazka: string | null;
		uvadec: string | null;
        origin: string;
        user: User;
	}

	const {
		e,
		t,
		montazka,
		uvadec,
        origin,
        user,
	}: Props = $props();

    const deviceType = ({
        'IR 10': 'CP-1015',
        'IR 12': 'CP-1054',
        'IR 14': 'CP-2007',
        'IR 30': 'CP-1054',
        'IR 34': 'CP-2007',
        'IR RegulusBOX': 'CP-2972',
        'IR RegulusHBOX': 'CP-2972',
        'IR RegulusHBOX K': 'CP-2972',
        'SOREL': '', // Shouldn't happen - see ir.ts: supportsRemoteAccess
        'other': '', // Shouldn't happen - see ir.ts: supportsRemoteAccess
        'Thermona': '', // Shouldn't happen - see ir.ts: supportsRemoteAccess
        'ctc': '', // Shouldn't happen - see ir.ts: supportsRemoteAccess
    } as const satisfies Record<IRTypes, string>)[e.ir.typ.first!];

    const irid = extractIRIDFromParts(e.ir.typ.first!, e.ir.cislo);
</script>

<p>Prosím o založení RegulusRoutu k tomuto regulátoru:</p>

<h2>Regulátor</h2>
<p><b>Typ zařízení:</b> {deviceType}</p>
<p><b>Výrobní číslo:</b> {e.ir.cislo}</p>
<p><b>Přihlášení:</b> {irName(e.ir)}</p>
<p><b>Poznámka:</b> {irLabel(e)}</p>
<h3>Zodpovědná osoba:</h3>
<p>{e.vzdalenyPristup.zodpovednaOsoba}</p>
<h3>Adresa:</h3>
<p><b>Město:</b> {e.mistoRealizace.obec}</p>
<p><b>Ulice:</b> {e.mistoRealizace.ulice}</p>
<p><b>PSČ:</b> {e.mistoRealizace.psc}</p>

<h3>Vzdálený přístup</h3>
<p>K regulátoru chce mít přístup {e.vzdalenyPristup.pristupMa.map(a => get(t.in.remoteAccess, a).toLowerCase()).join(', ')}</p>
<p>Vzdálený přístup zaplatí {get(t.in.remoteAccess, e.vzdalenyPristup.plati)?.toLowerCase() ?? ''}</p>

<h2>Uživatel</h2>
{#if e.koncovyUzivatel.typ === `individual`}
	<p><b>Jméno:</b> {e.koncovyUzivatel.jmeno}</p>
	<p><b>Příjmení:</b> {e.koncovyUzivatel.prijmeni}</p>
{/if}
<p><b>Přihlášení:</b> {endUserEmails(e.koncovyUzivatel)[0]}</p>
<p><b>Heslo:</b> Regulusroute1</p>
<p><b>Telefon:</b> {e.koncovyUzivatel.telefon}</p>
<p><b>Email:</b> {endUserEmails(e.koncovyUzivatel)[0]}</p>

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

<p>Odkaz na podrobnosti evidence: <a href={origin + detailIrUrl(irid)}>{origin + detailIrUrl(irid)}</a></p>

<p><b>Zaevidoval</b>: {user.displayName || user.email}</p>