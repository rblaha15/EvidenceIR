<script lang="ts">
    import { endUserName, irWholeName, spWholeName } from '$lib/helpers/ir';
    import type { Raw } from '$lib/forms/Form';
    import type { FormIN } from '$lib/forms/IN/formIN';
    import type { FormNSP } from '$lib/forms/NSP/formNSP';

    export type Props = { name: string, url: string, discountReason?: string, e: Raw<FormIN> | Raw<FormNSP> }
    const { name, url, discountReason, e }: Props = $props();
</script>

{#if discountReason}
    <p>Důvod slevy: {discountReason}</p>
{/if}

{#if !('zasah' in e)}
    <p>IR: {irWholeName(e)}</p>
{:else if !('ir' in e)}
    <p>SP: {spWholeName(e)}</p>
{/if}
<p>Uživatel: {endUserName(e.koncovyUzivatel)}</p>
<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
