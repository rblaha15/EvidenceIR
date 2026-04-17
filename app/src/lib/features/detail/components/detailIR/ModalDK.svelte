<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import { defaultDK, type FormPartDK, saveDK } from '$lib/forms/DK/formDK';
    import Widget from '$lib/components/Widget.svelte';
    import { onMount } from 'svelte';
    import { type ContextChangeDK, getDKInfo } from '$lib/features/detail/domain/detailIR/DK';
    import { defaultFormGroupValues, type FormPartValues, widgetListFromGroup } from '$lib/forms/Form';
    import { Bell, SendHorizontal } from '@lucide/svelte';
    import Button from "$lib/components/Button.svelte";

    const { t, ir, type }: {
        t: Translations, ir: IR, type: 'TČ' | 'SOL'
    } = $props();
    const tr = $derived(t.dk);

    let loading = $state(false);
    let error = $state(false);

    const { settings, show, commissionDate } = $derived(getDKInfo(type, ir));
    const f = $derived<FormPartDK<ContextChangeDK>>(defaultDK<ContextChangeDK>(type, commissionDate, settings));
    let v = $state({} as FormPartValues<FormPartDK<ContextChangeDK>>);
    $effect(() => {
        v = defaultFormGroupValues(f);
    });

    const list = $derived(widgetListFromGroup<ContextChangeDK, FormPartDK<ContextChangeDK>>(f, v));
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
        // const modal = (await import('bootstrap')).Modal.getInstance(`#recommendations${type}Modal`);
        const success = await saveDK(ir, v, type);
        if (success)
            void 0// modal?.hide(); TODO
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
    <div aria-hidden="true" aria-labelledby="recommendations{type}ModalLabel" class="modal fade hidden" id="recommendations{type}Modal"
         tabindex="-1" bind:this={modal}>
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title" id="recommendations{type}ModalLabel">
                        <Bell />
                        {tr.settingsTitle(type)}
                    </h1>
                    <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body flex flex-col gap-4">
                    {#each list as item}
                        <Widget widget={item.widget} bind:value={item.value} {t} {context} {showAllErrors} />
                    {/each}
                </div>
                <div class="modal-footer">
                    {#if error}
                        <div class="text-danger">{@html t.form.somethingWentWrongContactUsHtml}</div>
                    {/if}
                    <div class="flex gap-1 items-center">
                        {#if loading}
                            <div class="spinner-border text-danger"></div>
                        {/if}
                        <button class="btn btn-warning" disabled={loading} onclick={save}>
                            {#if v.enabled !== Boolean(settings) && !f.executingCompany.isError(context, v.executingCompany)}
                                <SendHorizontal />
                            {/if}
                            {tr.save}
                        </button>
                        <Button variant="secondary" text={tr.cancel} dismissModal />
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}