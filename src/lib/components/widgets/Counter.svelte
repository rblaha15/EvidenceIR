<script lang="ts" generics="D">
    import type { Translations } from '$lib/translations';
    import { CounterWidget } from '$lib/Vec.svelte';

    interface Props {
        t: Translations;
        widget: CounterWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

</script>

{#if widget.show(data)}
    <p class="mb-1">{t.get(widget.label(data))}</p>
    <div class="d-flex flex-row mb-2 align-items-center">
        <button class="btn btn-sm btn-secondary" onclick={() => widget.value--}
                disabled={widget.value === widget.min(data)}>-</button>
        <span class="m-2">{widget.value}</span>
        <button class="btn btn-sm btn-secondary" onclick={() => widget.value++}
                disabled={widget.value === widget.max(data)}>+</button>
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data))}</span>
    {/if}
{/if}
