<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type CheckboxWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import type { MouseEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: CheckboxWidget<C>;
        context: C;
        value: boolean;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();

    const onClick: MouseEventHandler<HTMLInputElement | HTMLButtonElement> = e => {
        e.stopPropagation();
        if (!widget.lock(context)) {
            const newValue = !value;
            value = newValue;
            widget.onValueSet(context, newValue);
        }
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button class="input-group-text input-group-input" onclick={onClick}
                aria-labelledby="label-{uid}" tabindex="-1" disabled={widget.lock(context)}
        >
            <input class="form-check-input m-0" type="checkbox" role="button"
                   disabled={widget.lock(context)} checked={value} onclick={onClick} />
        </button>
        <button onclick={onClick} tabindex="-1"
                id="label-{uid}" class="input-group-text flex-grow-1 d-flex flex-column align-items-start"
        >
            {#if widget.label(t, context)}
                <p class="m-0">{labelAndStar(widget, context, t)}</p>
            {/if}
            {#if widget.descriptionItems(t, context).length}
                <ul class="m-0">
                    {#each widget.descriptionItems(t, context) as item}
                        <li>{item}</li>
                    {/each}
                </ul>
            {/if}
        </button>
    </div>

    {#if widget.showError(context, value)}
        <p class="text-danger">{widget.onError(t, context)}</p>
    {/if}
</div>