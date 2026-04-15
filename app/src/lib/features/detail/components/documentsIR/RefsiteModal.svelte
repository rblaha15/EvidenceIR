<script lang="ts">
    import type { PumpInfo } from '$lib/forms/IN/infoIN';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import { confirmRefsite } from '$lib/features/detail/actions/documentsIR/refsite';
    import type { ExistingIR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';

    const {
        tc, td, ir, irid
    }: {
        ir: ExistingIR,
        irid: IRID,
        tc: PumpInfo,
        td: Translations['detail'],
    } = $props()
</script>

<div class="modal fade" id="refsiteModal-{tc.N}" tabindex="-1" aria-labelledby="refsiteModalLabel-{tc.N}" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="refsiteModalLabel-{tc.N}">{td.refsiteTitle}</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                {@html td.refsiteHtml}
            </div>
            <div class="modal-footer">
                <a class="btn btn-secondary" href={iridUrl(`/RKT?pump=${tc.N}`)} data-bs-dismiss="modal"
                   onclick={confirmRefsite(ir, tc.N)}>{td.no}</a>
                <a class="btn btn-primary" href={iridUrl(`/RKT?pump=${tc.N}`)} data-bs-dismiss="modal"
                   onclick={confirmRefsite(ir, tc.N, true)}>{td.yes}</a>
            </div>
        </div>
    </div>
</div>