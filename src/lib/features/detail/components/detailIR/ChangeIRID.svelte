<script lang="ts">
    import { type Translations } from '$lib/translations';
    import { untrack } from 'svelte';
    import { type IRID } from '$lib/helpers/ir';
    import { type IR } from '$lib/data';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { alsoChangeDefault, createFormPart, type StateChangeIRID } from '$lib/features/detail/domain/detailIR/changeController';
    import { changeController } from '$lib/features/detail/actions/detailIR/changeController';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    let mode: StateChangeIRID = $state('hidden');
    let error = $state<string>();

    let alsoChange = $state(alsoChangeDefault);

    const part = createFormPart(
        v => alsoChange = { ...alsoChange, ...v },
    );

    const d = $derived({ ir: part });

    $effect(() => {
        if (!ir) return;
        untrack(() => {
            part.typ.setValue(d, ir.IN.ir.typ);
            part.cislo.setValue(d, ir.IN.ir.cislo);
        });
    });

    const action = $derived(
        changeController(part, d, alsoChange, (m, e) => {
            mode = m;
            error = e
        }, irid)
    )
</script>

{#if mode === 'hidden'}
    <button class="btn btn-secondary d-block" onclick={() => (mode = 'input')}>
        <Icon icon="drive_file_rename_outline" />
        {td.changeController}
    </button>
{:else if mode === 'input'}
    <div class="d-flex flex-column gap-3 w-100">
        <Widget bind:widget={part.typ} data={d} {t} />
        <Widget bind:widget={part.cislo} data={d} {t} />
        <div class="d-flex gap-3">
            <button class="btn btn-danger" onclick={action}>{td.confirm}</button>
            <button class="btn btn-secondary" onclick={() => (mode = 'hidden')}>{td.cancel}</button>
        </div>
    </div>
{:else if mode === 'sending'}
    <div class="d-flex align-items-center">
        <span>{td.saving}</span>
        <div class="spinner-border text-danger"></div>
    </div>
{:else if mode === 'fail'}
    <p class="text-danger">{td.changeWentWrong}</p>
    {#if error}
        <p class="alert alert-danger w-100">
            {#each error.split('\n') as line, i}
                {#if i !== 0}<br />{/if}
                {line}
            {/each}
        </p>
    {/if}
{/if}