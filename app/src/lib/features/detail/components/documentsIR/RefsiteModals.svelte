<script lang="ts">
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import RefsiteModal from '$lib/features/detail/components/documentsIR/RefsiteModal.svelte';
    import type { ExistingIR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';

    const {
        td, ir, irid
    }: {
        ir: ExistingIR,
        irid: IRID,
        td: Translations['detail'],
    } = $props()
</script>

{#each cascadePumps(ir.IN) as tc}
    <RefsiteModal {tc} {ir} {irid} {td} />
{/each}