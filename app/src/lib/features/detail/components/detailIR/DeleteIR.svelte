<script lang="ts">
    import { removeIR } from '$lib/features/detail/actions/detailIR/ir';
    import type { Translations } from '$lib/translations';
    import type { IRID } from '$lib/helpers/ir';
    import { Trash2 } from '@lucide/svelte';

    const { td, irid }: {
        td: Translations['detail'],
        irid: IRID,
    } = $props()
</script>

<button class="btn btn-secondary block" data-bs-target="#deleteModal" data-bs-toggle="modal">
    <Trash2 />
    {td.deleteThisRecord}
</button>

<div aria-hidden="true" aria-labelledby="deleteModalLabel" class="modal fade hidden" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title" id="deleteModalLabel">
                    <Trash2 />
                    {td.delete}
                </h1>
                <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>
            <div class="modal-body">
                {td.confirmDeletion}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-bs-dismiss="modal" type="button">{td.cancel}</button>
                <button class="btn btn-danger" onclick={removeIR(irid)} type="button">{td.delete}</button>
            </div>
        </div>
    </div>
</div>