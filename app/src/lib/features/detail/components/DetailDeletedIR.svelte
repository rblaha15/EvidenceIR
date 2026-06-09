<script lang="ts">
    import type { DeletedIR } from '$lib/data';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { iaA } from '$lib/helpers/stores';
    import { restoreIR } from '$lib/features/detail/actions/restore';
    import Dates from '$lib/features/detail/components/Dates.svelte';
    import { Eye, Server, ArchiveRestore } from "@lucide/svelte";
    import { Button } from '$lib/components/ui/button';

    let { ir, td }: {
        ir: DeletedIR,
        td: Translations['detail'],
    } = $props();
</script>
<div>
    {#if ir.meta.movedTo}
        {td.movedIR}
        <Button variant="link" href={detailIrUrl(ir.meta.movedTo)} class="px-0">
            {td.newAddress}
        </Button>{td.movedIRend}
    {:else}
        {td.deletedIR}
    {/if}
</div>

{#if $isUserAdmin}
    <div class="flex flex-col items-end gap-1">
        <Button variant="secondary" href={relUrl(`/IN?view-irid=${ir.meta.id}`)}>
            <Eye /> {td.viewFilledData}
        </Button>
        <Button variant="danger" onclick={restoreIR(ir.meta.id)}>
            <ArchiveRestore />
            Obnovit evidenci instalace{iaA}
        </Button>
        <Button variant="secondary"
                href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{ir.meta.id}"
                target="_blank">
            <Server /> {td.openInDatabase}{iaA}
        </Button>
    </div>
{/if}

<div class="flex flex-col items-end">
    <Dates data={ir} />
</div>