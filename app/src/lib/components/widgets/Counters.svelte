<script generics="D, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CountersWidget } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CountersWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const sum = $derived(widget.value.getValues().reduce((v, acc) => acc + v, 0));

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div>{widget.label(t, data)}</div>
    <div class="input-group input-group-grid" style="--grid-cols: 4">
        {#each widget.value.entries() as [option, value]}
            <button class="btn btn-outline-primary first" onclick={() =>
                widget.mutateValue(data, v => ({ ...v, [option]: v[option] - 1 }))
            } disabled={value === 0}
            ><strong>-</strong></button>
            <span class="input-group-text input-group-input">{value}</span>
            <button class="btn btn-outline-primary" onclick={
                () => widget.mutateValue(data, v => ({ ...v, [option]: v[option] - 1 }))
            } disabled={sum === widget.max(data)}
            ><strong>+</strong></button>
            <div class="input-group-text last" id="label-{uid}">{widget.get(t, option)}</div>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{widget.onError(t, data)}</span>
    {/if}
</div>
