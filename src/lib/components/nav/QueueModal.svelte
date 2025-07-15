<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { readableQueue } from '$lib/client/offlineQueue';

    const { t }: { t: Translations } = $props();
</script>

<div class="modal fade" id="queue" tabindex="-1" aria-labelledby="queueLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="queueLabel">Fronta neodeslaných změn a emailů</h4>
                <button
                    aria-label={t.close}
                    class="btn-close"
                    data-bs-dismiss="modal"
                ></button>
            </div>

            <div class="modal-body d-flex flex-column gap-3">
                <div>Jste offline a provedli jste několik změn v datech aplikace. Tyto upravené informace můžete standartně zobrazit a upravovat v aplikaci, ale NEODEŠLOU se na server, dokud aplikaci nezapnete S PŘIPOJENÍM K INTERNETU!</div>
                <h5>Provedené, neodeslané změny:</h5>
                <ol class="list-group list-group-flush list-group-numbered">
                    {#each $readableQueue as dwo}
                        <li class="list-group-item d-flex gap-3 align-items-center">
                            <i class="bi-{dwo.type === 'database' ? 'database-fill-gear' : 'envelope-arrow-up'} fs-5"></i>
                            <span class="flex-grow-1">{dwo.subject}</span>
                        </li>
                    {/each}
                </ol>
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                >{t.close}</button>
            </div>
        </div>
    </div>
</div>