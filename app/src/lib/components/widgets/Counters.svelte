<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CountersWidget } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CountersWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const sum = $derived(widget.value.reduce((v, acc) => acc + v, 0))
</script>

{#if widget.show(data)}
    <p class="mb-1">{t.get(widget.label(data, t))}</p>
    {#each widget.options(data) as option, i}
        <div class="d-flex flex-row mb-2 align-items-center">
            <span class="me-2">{t.get(option)}</span>
            <button class="btn btn-sm btn-secondary" onclick={() =>
                widget.mutateValue(data, v => v.with(i, v[i] - 1))
            } disabled={widget.value[i] === 0}><strong>-</strong></button>
            <span class="m-2">{widget.value[i]}</span>
            <button class="btn btn-sm btn-secondary" onclick={() =>
                widget.mutateValue(data, v => v.with(i, v[i] + 1))
            } disabled={sum === widget.max(data)}><strong>+</strong></button>
        </div>
    {/each}

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}
{/if}
