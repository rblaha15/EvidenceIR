<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import { defaultDK, type FormPartDK, saveDK } from '$lib/forms/DK/formDK';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { onMount } from 'svelte';
    import { type ContextChangeDK, getDKInfo } from '$lib/features/detail/domain/detailIR/DK';
    import Button from '$lib/components/Button.svelte';
    import { defaultFormGroupValues } from '$lib/forms/Form';

    const { t, ir, type }: {
        t: Translations, ir: IR, type: 'TČ' | 'SOL'
    } = $props();
    const tr = $derived(t.dk);

    let loading = $state(false);
    let error = $state(false);

    const { settings, show, commissionDate } = $derived(getDKInfo(type, ir));
    const f = $derived<FormPartDK<ContextChangeDK>>(defaultDK<ContextChangeDK>(type, commissionDate, settings));
    let v = $derived(defaultFormGroupValues(f));
    let showAllErrors = $state(false);
    const context = $derived({ DK: v, IN: ir.IN, mode: 'create' as const });

    $effect(() => {
        v.enabled = Boolean(settings);
        v.executingCompany = settings?.executingCompany ?? null;
    });

    const save = async () => {
        showAllErrors = true;
        if (f.executingCompany.isError(context, v.executingCompany) || f.commissionDate.isError(context, v.commissionDate)) return;
        error = false;
        loading = true;
        const modal = (await import('bootstrap')).Modal.getInstance(`#recommendations${type}Modal`);
        const success = await saveDK(ir, v, type);
        if (success)
            modal?.hide();
        else {
            error = true;
            loading = false;
        }
    };

    const init = () => {
        loading = false;
        error = false;
        showAllErrors = false;
    }

    let modal = $state() as HTMLDivElement;

    onMount(() => {
        modal.addEventListener('shown.bs.modal', init);
    });
</script>

{#if show}
    <div aria-hidden="true" aria-labelledby="recommendations{type}ModalLabel" class="modal fade" id="recommendations{type}Modal"
         tabindex="-1" bind:this={modal}>
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
                    <Widget bind:value={v.commissionDate} widget={f.commissionDate} {context} {t} {showAllErrors} />
                    <Widget bind:value={v.enabled} widget={f.enabled} {context} {t} {showAllErrors} />
                    <Widget bind:value={v.executingCompany} widget={f.executingCompany} {context} {t} {showAllErrors} />
                    <Widget bind:value={v.chosenCompany} widget={f.chosenCompany} {context} {t} {showAllErrors} />
                </div>
                <div class="modal-footer">
                    {#if error}
                        <div class="text-danger">{@html t.form.somethingWentWrongContactUsHtml}</div>
                    {/if}
                    <div class="d-flex gap-1 align-items-center">
                        {#if loading}
                            <div class="spinner-border text-danger"></div>
                        {/if}
                        <button class="btn btn-warning" disabled={loading} onclick={save}>
                            {#if v.enabled !== Boolean(settings) && !f.executingCompany.isError(context, v.executingCompany)}
                                <Icon icon="send" />
                            {/if}
                            {tr.save}
                        </button>
                        <Button color="secondary" text={tr.cancel} dismissModal />
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}