<script lang="ts">
    import type { DeletedIR } from '$lib/data';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { iaA } from '$lib/helpers/stores';
    import Dates from '$lib/features/detail/components/Dates.svelte';
    import { Eye, Server } from "@lucide/svelte";
    import Button from "$lib/components/Button.svelte";

    let { ir, td }: {
        ir: DeletedIR,
        td: Translations['detail'],
    } = $props();
</script>
<div>
    {#if ir.meta.movedTo}
        {@html td.movedIRHtml({ link: detailIrUrl(ir.meta.movedTo) })}
    {:else}
        {td.deletedIR}
    {/if}
</div>

{#if $isUserAdmin}
    <div class="flex flex-col items-end gap-1">
        <Button variant="secondary" href={relUrl(`/IN?view-irid=${ir.meta.id}`)} icon={Eye}
                text={td.viewFilledData} />
        {#if $isUserAdmin}
            <Button variant="secondary" icon={Server} text="{td.openInDatabase}{iaA}"
                    href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{ir.meta.id}"
                    target="_blank" />
        {/if}
    </div>
{/if}

<div class="flex flex-col items-end">
    <Dates data={ir} />
</div>