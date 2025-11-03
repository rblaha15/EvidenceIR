<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { defaultRKD, type FormPartRKD, saveRKD } from '$lib/forms/RKD/formRKD';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { aA } from '$lib/helpers/stores';

    const { t, ir }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();
    const tr = $derived(t.rkt.recommendations);

    type D = { rkd: FormPartRKD<D>, evidence: IR['evidence'] }

    let loading = $state(false);
    let error = $state(false);

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
        error = false;
        loading = true;
        const modal = (await import('bootstrap')).Modal.getInstance('#recommendationsModal');
        const success = await saveRKD(ir, f);
        if (success)
            modal?.hide();
        else {
            error = true;
            loading = false;
        }
    };
</script>

{#if ir.uvedeniTC}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <button class="btn btn-info d-block" data-bs-target="#recommendationsModal" data-bs-toggle="modal" onclick={() => {
            loading = false
            error = false
            f.executingCompany.displayErrorVeto = false
        }}>
            <Icon icon="alarm" />
            {tr.settingsTitle}
        </button>
        {#if $isUserAdmin && ir.yearlyHeatPumpCheckRecommendation?.code}
            <a tabindex="0" class="btn btn-secondary" target="_blank"
               href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Frk~2F{ir.yearlyHeatPumpCheckRecommendation?.code}">
                <Icon icon="cloud_circle" />
                {t.detail.openInDatabase}{$aA}
            </a>
        {/if}
    </div>

    <div aria-hidden="true" aria-labelledby="recommendationsModalLabel" class="modal fade" id="recommendationsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="recommendationsModalLabel">
                        <Icon icon="alarm" />
                        {tr.settingsTitle}
                    </h1>
                    <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body d-flex flex-column gap-3">
                    <Widget bind:widget={f.enabled} {data} {t} />
                    <Widget bind:widget={f.executingCompany} {data} {t} />
                    <Widget bind:widget={f.chosenCompany} {data} {t} />
                </div>
                <div class="modal-footer">
                    {#if error}
                        <div class="text-danger">{@html t.form.somethingWentWrongContactUsHtml}</div>
                    {/if}
                    <div class="d-flex gap-1 align-items-center">
                        {#if loading}
                            <div class="spinner-border text-danger"></div>
                        {/if}
                        <button class="btn btn-warning" onclick={save} disabled={loading}>
                            {#if f.enabled.value !== Boolean(ir.yearlyHeatPumpCheckRecommendation) && !f.executingCompany.isError(data)}
                                <Icon icon="send" />
                            {/if}
                            {tr.save}
                        </button>
                        <button class="btn btn-secondary" data-bs-dismiss="modal">
                            {tr.cancel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}