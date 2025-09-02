<script lang="ts">
	import { type FormIN } from '$lib/forms/IN/formIN';
	import type { Translations } from '$lib/translations';
	import { irName, irLabel, extractIRIDFromParts } from '$lib/helpers/ir';
	import type { Raw } from '$lib/forms/Form';
	import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import type { User } from 'firebase/auth';

	interface Props {
		e: Raw<FormIN>;
        origin: string;
        user: User;
	}

	const {
		e,
        origin,
        user,
	}: Props = $props();

    const irid = extractIRIDFromParts(e.ir.typ.first!, e.ir.cislo);
</script>

<p>Odkaz na podrobnosti evidence: <a href={origin + detailIrUrl(irid)}>{origin + detailIrUrl(irid)}</a></p>

<p><b>Zaevidoval</b>: {user.displayName || user.email}</p>