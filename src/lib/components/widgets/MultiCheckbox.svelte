<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { nazevSHvezdou, type MultiCheckboxWidget } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const pocet = $derived(widget.value.length)
    const value = $derived(widget.bindableValue(data))
</script>

{#if widget.show(data)}
    <label class="d-block" for="">{nazevSHvezdou(widget, data, t)}</label>
    {#each widget.options(data) as moznost}
        <div class="form-check">
            <label class="form-check-label">
                {t.get(moznost)}
                <input type="checkbox" disabled={!widget.value.includes(moznost) && pocet >= widget.max(data)} class="form-check-input" value={moznost}
                       bind:group={value.value} />
            </label>
        </div>
    {/each}

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}

    <div class="mb-3"></div>
{/if}
