<script lang="ts">
	import { type FormIN } from '$lib/forms/IN/formIN';
    import { appUrl } from '$lib/helpers/globals';
    import { extractIRIDFromParts, endUserName, irWholeName } from '$lib/helpers/ir';
	import type { Raw } from '$lib/forms/Form';
	import { detailUrlIR } from '$lib/helpers/runes.svelte';
    import type { User } from '$lib/client/auth';

	interface Props {
		e: Raw<FormIN>;
        user: User;
	}

	const {
		e,
        user,
	}: Props = $props();

    // svelte-ignore state_referenced_locally
    const irid = extractIRIDFromParts(e.ir.typ.first!, e.ir.cislo);
</script>

<p>IR: {irWholeName(e)}</p>
<p>Uživatel: {endUserName(e.koncovyUzivatel)}</p>
<p>Odkaz na podrobnosti evidence: <a href={appUrl + detailUrlIR(irid)}>{appUrl + detailUrlIR(irid)}</a></p>

<p><b>Zaevidoval</b>: {user.name}</p>