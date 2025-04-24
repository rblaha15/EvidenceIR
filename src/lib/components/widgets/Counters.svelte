<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CountersWidget } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CountersWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const sum = $derived(widget.value.reduce((v, acc) => acc + v, 0));

    const uid = $props.id();
</script>

{#if widget.show(data)}
    <label class="d-block" for="">{t.get(widget.label(data, t))}</label>
    <div class="input-group input-group-grid" style="width: min-content; --grid-cols: 4">
        {#each widget.options(data) as option, i}
            <span class="input-group-text w-auto first" id="label-{uid}">{t.get(option)}</span>
            <button class="btn btn-outline-primary" onclick={() =>
                widget.mutateValue(data, v => v.with(i, v[i] - 1))
            } disabled={widget.value[i] === 0}
            ><strong>-</strong></button>
            <span class="input-group-text input-group-input">{widget.value[i]}</span>
            <button class="btn btn-outline-primary last" onclick={
                () => widget.mutateValue(data, v => v.with(i, v[i] + 1))
            } disabled={sum === widget.max(data)}
            ><strong>+</strong></button>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}

    <div class="mb-3"></div>
{/if}
