<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { defaultDK, type FormPartDK, saveDK } from '$lib/forms/DK/formDK';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { aA } from '$lib/helpers/stores';

    const { t, ir, type }: {
        t: Translations, ir: IR, irid: IRID, type: 'TČ' | 'SOL'
    } = $props();
    const tr = $derived(t.dk);

    type D = { dk: FormPartDK<D>, evidence: IR['evidence'] }

    let loading = $state(false);
    let error = $state(false);

    const f = $state<FormPartDK<D>>(defaultDK<D>(type));
    const data = $derived({ dk: f, evidence: ir.evidence });
    const settings = $derived(type == 'TČ' ? ir.yearlyHeatPumpCheckRecommendation : ir.yearlySolarSystemCheckRecommendation);

    $effect(() => {
        f.enabled.setValue(data, Boolean(settings));
        f.executingCompany.setValue(data, settings?.executingCompany ?? null);
    });

    const save = async () => {
        f.executingCompany.displayErrorVeto = true;
        if (f.executingCompany.isError(data)) return;
        error = false;
        loading = true;
        const modal = (await import('bootstrap')).Modal.getInstance(`#recommendations${type}Modal`);
        const success = await saveDK(ir, f, type);
        if (success)
            modal?.hide();
        else {
            error = true;
            loading = false;
        }
    };
</script>

{#if type === 'TČ' && ir.uvedeniTC?.uvadeni?.date || type === 'SOL' && ir.uvedeniSOL}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <button class="btn btn-info d-block" data-bs-target="#recommendations{type}Modal" data-bs-toggle="modal" onclick={() => {
            loading = false
            error = false
            f.executingCompany.displayErrorVeto = false
        }}>
            <Icon icon="alarm" />
            {tr.settingsTitle(type)}
        </button>
        {#if $isUserAdmin && settings?.code}
            <a tabindex="0" class="btn btn-secondary" target="_blank"
               href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Frk~2F{settings?.code}">
                <Icon icon="cloud_circle" />
                {t.detail.openInDatabase}{$aA}
            </a>
        {/if}
    </div>

    <div aria-hidden="true" aria-labelledby="recommendations{type}ModalLabel" class="modal fade" id="recommendations{type}Modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="recommendations{type}ModalLabel">
                        <Icon icon="alarm" />
                        {tr.settingsTitle(type)}
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
                            {#if f.enabled.value !== Boolean(settings) && !f.executingCompany.isError(data)}
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