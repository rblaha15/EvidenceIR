<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import Icon from '$lib/components/Icon.svelte';
    import { labelAndStar, type RadioWithInputWidget, type RaI } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: RadioWithInputWidget<C, I>;
        context: C;
        value: RaI<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const chosen = $derived({
        get value() {
            return value.chosen;
        },
        set value(chosen) {
            const newValue = { ...value, chosen };
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        },
    });

    const uid = $props.id();

    const other = widget.options(context).at(-1)!;
</script>

<div class="flex gap-1 flex-column">
    <div class="flex align-items-center">
        {labelAndStar(widget, context, t)}
        {#if !widget.required(context)}
            <button class="btn py-1 px-2 m-1" aria-label={t.widget.clearSelection} onclick={() => chosen.value = null}>
                <Icon icon="clear" />
            </button>
        {/if}
    </div>
    <div class="input-group input-group-grid" style="--grid-cols: 3">
        {#each widget.options(context) as item}
            <button class="input-group-text input-group-input first" onclick={() => chosen.value = item}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1" style:grid-column={'1'}
            >
                <input class="form-check-input m-0" type="radio" role="button"
                       bind:group={chosen.value} value={item} />
            </button>
            <button onclick={() => chosen.value = item} tabindex="-1"
                    style:grid-column={item === other && chosen.value === other ? '2' : '2 / span 2'}
                    id="label-{uid}-{item}" class={["input-group-text", { last: item !== other }]}
            >{widget.get(t, item)}</button>
            {#if item === other && chosen.value === other}
                {#if chosen.value !== other}
                    <input type="text" readonly
                           onclick={() => chosen.value = other} class="form-control shadow-none input-group-text"
                           role="button" disabled={widget.lock(context)} tabindex="-1" />
                {:else}
                    <div class="form-floating w-100">
                        <input
                            type={widget.type(context)}
                            inputmode={widget.inputmode(context)}
                            enterkeyhint={widget.enterkeyhint(context)}
                            autocapitalize={widget.autocapitalize(context)}
                            placeholder={widget.otherLabel(t, context)}
                            class="form-control last w-100"
                            value={value.text}
                            oninput={e => {
                                const newValue = { chosen: other, text: e.currentTarget.value ?? value.text };
                                value = newValue;
                                widget.onValueSet(context, newValue);
                            }}
                            onblur={() => showError = true}
                            disabled={widget.lock(context)}
                        />
                        <label for="">{widget.otherLabel(t, context)}</label>
                    </div>
                {/if}
            {/if}
        {/each}
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>