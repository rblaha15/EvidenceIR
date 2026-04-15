<script lang="ts">
    import { endUserName, irWholeName, spWholeName } from '$lib/helpers/ir';
    import type { Raw } from '$lib/forms/Form';
    import type { FormIN } from '$lib/forms/IN/formIN';
    import type { FormNSP } from '$lib/forms/NSP/formNSP';

    export type Props = {
        name: string, url: string, e: Raw<FormIN> | Raw<FormNSP>,
        warrantyInfo?: string, routeApproval?: string, discountReason?: string
    }
    const { name, url, e, warrantyInfo, routeApproval, discountReason }: Props = $props();
</script>

{#if discountReason}
    <p>Důvod slevy: {discountReason}</p>
{/if}

{#if warrantyInfo}
    <p>Záruka: KOMPLET 10: {warrantyInfo}</p>
{/if}

{#if routeApproval}
    <p>Souhlasí s RegulusRoute: {routeApproval}</p>
{/if}

{#if !('zasah' in e)}
    <p>IR: {irWholeName(e)}</p>
{:else if !('ir' in e)}
    <p>SP: {spWholeName(e)}</p>
{/if}
<p>Uživatel: {endUserName(e.koncovyUzivatel)}</p>
<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
