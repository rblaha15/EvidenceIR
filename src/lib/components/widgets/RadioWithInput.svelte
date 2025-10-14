<script generics="D, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type RadioWithInputWidget } from '$lib/forms/Widget.svelte.js';
    import Icon from '$lib/components/Icon.svelte';

    interface Props {
        t: Translations;
        widget: RadioWithInputWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const chosen = $derived({
        get value() {
            return widget.value.chosen;
        },
        set value(chosen) {
            widget.mutateValue(data, v => ({ ...v, chosen }));
        },
    });

    const uid = $props.id();

    const other = widget.options(data).at(-1)!;
</script>

<div class="d-flex gap-1 flex-column">
    <div class="d-flex align-items-center">
        {labelAndStar(widget, data, t)}
        {#if !widget.required(data)}
            <button class="btn py-1 px-2 m-1" aria-label={t.widget.clearSelection} onclick={() => chosen.value = null}>
                <Icon icon="clear" />
            </button>
        {/if}
    </div>
    <div class="input-group input-group-grid" style="--grid-cols: 3">
        {#each widget.options(data) as item}
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
                           role="button" disabled={widget.lock(data)} tabindex="-1" />
                {:else}
                    <div class="form-floating w-100">
                        <input
                            type={widget.type(data)}
                            inputmode={widget.inputmode(data)}
                            enterkeyhint={widget.enterkeyhint(data)}
                            autocapitalize={widget.autocapitalize(data)}
                            placeholder={widget.otherLabel(t, data)}
                            class="form-control last w-100"
                            value={widget.value.text}
                            oninput={e => {
                                widget.mutateValue(data, v => (
                                    { chosen: other, text: e.currentTarget.value ?? v.text }
                                ));
                            }}
                            disabled={widget.lock(data)}
                        />
                        <label for="">{widget.otherLabel(t, data)}</label>
                    </div>
                {/if}
            {/if}
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger">{widget.onError(t, data)}</span>
    {/if}
</div>