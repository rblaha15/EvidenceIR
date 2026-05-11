<script lang="ts">
    import type { DeletedIR } from '$lib/data';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { iaA } from '$lib/helpers/stores';
    import { restoreIR } from '$lib/features/detail/actions/restore';
    import Icon from '$lib/components/Icon.svelte';
    import Dates from '$lib/features/detail/components/Dates.svelte';

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
    <div class="d-flex flex-column align-items-end gap-1">
        <a class="btn btn-secondary" href={relUrl(`/IN?view-irid=${ir.meta.id}`)}
           tabindex="0">
            <Icon icon="preview" />
            {td.viewFilledData}{iaA}
        </a>
        <button class="btn btn-danger" onclick={restoreIR(ir.meta.id)}>
            <Icon icon="restore_from_trash" />
            Obnovit evidenci instalace{iaA}
        </button>
        <a tabindex="0" class="btn btn-secondary" target="_blank"
           href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{ir.meta.id}">
            <Icon icon="cloud_circle" />
            {td.openInDatabase}{iaA}
        </a>
    </div>
{/if}

<div class="d-flex flex-column align-items-end">
    <Dates data={ir} />
</div>