<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type CheckboxWidget, labelAndStar } from '$lib/Widget.svelte.js';
    import type { MouseEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: CheckboxWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onClick: MouseEventHandler<HTMLInputElement | HTMLButtonElement> = e => {
        e.stopPropagation();
        if (!widget.lock(data)) widget.mutateValue(data, v => !v);
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button class="input-group-text input-group-input" onclick={onClick}
                aria-labelledby="label-{uid}" tabindex="-1" disabled={widget.lock(data)}
        >
            <input class="form-check-input m-0" type="checkbox" role="button"
                   disabled={widget.lock(data)} checked={widget.value} onclick={onClick} />
        </button>
        <button onclick={onClick} tabindex="-1"
                id="label-{uid}" class="input-group-text flex-grow-1"
        >{labelAndStar(widget, data, t)}</button>
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}
</div>