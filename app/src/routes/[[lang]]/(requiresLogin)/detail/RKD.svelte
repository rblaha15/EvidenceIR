<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { defaultRKD, type FormPartRKD, saveRKD } from '$lib/forms/RKD/formRKD';
    import Widget from '$lib/components/Widget.svelte';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();

    type D = { rkd: FormPartRKD<D>, evidence: IR['evidence'] }

    const f = $state<FormPartRKD<D>>(defaultRKD<D>());
    const data = $derived({ rkd: f, evidence: ir.evidence });

    $effect(() => {
        const disabled = !ir.yearlyHeatPumpCheckRecommendation;
        f.enabled.setValue(data, !disabled);
        f.executingCompany.setValue(data, ir.yearlyHeatPumpCheckRecommendation?.executingCompany ?? null);
    });

    const save = async () => {
        f.executingCompany.displayErrorVeto = true;
        if (f.executingCompany.isError(data)) return;
        await saveRKD(ir, f);
        (await import('bootstrap')).Modal.getInstance('#recommendationsModal')?.hide();
    };
</script>

{#if ir.uvedeniTC}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <button class="btn btn-info d-block" data-bs-target="#recommendationsModal" data-bs-toggle="modal"
                onclick={() => f.executingCompany.displayErrorVeto = false}>
            <span class="material-icons">alarm</span>
            Nastavení RK
        </button>
    </div>

    <div aria-hidden="true" aria-labelledby="recommendationsModalLabel" class="modal fade" id="recommendationsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="recommendationsModalLabel">
                        <span class="material-icons">alarm</span>
                        Nastavení RK
                    </h1>
                    <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body d-flex flex-column gap-3">
                    <Widget bind:widget={f.enabled} {data} {t} />
                    <Widget bind:widget={f.executingCompany} {data} {t} />
                    <Widget bind:widget={f.chosenCompany} {data} {t} />
                </div>
                <div class="modal-footer">
                    <div class="d-flex gap-1">
                        <button class="btn btn-warning" onclick={save}>
                            Uložit
                        </button>
                        <button class="btn btn-secondary" data-bs-dismiss="modal">
                            Zrušit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}