<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type CheckboxWidget, nazevSHvezdou } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CheckboxWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onClick = () => {
        if (!widget.lock(data)) widget.mutateValue(data, v => !v);
    };

    const uid = $props.id();
</script>

{#if widget.show(data)}
    <div class="input-group">
        <button class="input-group-text" onclick={onClick} aria-labelledby="label-{uid}" tabindex="-1">
            <input class="form-check-input m-0" type="checkbox" role="button" disabled={widget.lock(data)} bind:checked={widget.value} />
        </button>
        <input type="text" placeholder={nazevSHvezdou(widget, data, t)} readonly onclick={onClick}
               class="form-control shadow-none" role="button" disabled={widget.lock(data)}
               tabindex="-1" style="border-color: var(--bs-border-color)" id="label-{uid}" />
    </div>

    {#if widget.showError(data)}
        <p class="text-danger mt-1">{t.get(widget.onError(data, t))}</p>
    {/if}

    <div class="mb-3"></div>
{/if}
