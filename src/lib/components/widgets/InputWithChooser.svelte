<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { InputWithChooserWidget, labelAndStar, type SeI } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: InputWithChooserWidget<C, I>;
        context: C;
        value: SeI<I>;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();

    type MyOpts = {
        lazy: boolean;
        overwrite: boolean;
        mask: string;
        definitions: {
            [key: string]: RegExp;
        };
        value?: string;
    };

    const maybeCapitalized = (value: string, widget: InputWithChooserWidget<C, I>): string =>
        widget.capitalize(context) ? value.toUpperCase() : value;

    let input = $state<HTMLInputElement>();
    let textarea = $state<HTMLTextAreaElement>();
    let mask = $state<InputMask<MyOpts>>();

    let opts = $derived(widget.maskOptions(context));

    let options = $derived(
        !opts
            ? undefined
            : ({
                lazy: true,
                overwrite: true,
                ...opts,
            } as MyOpts),
    );

    onMount(() => {
        if (options != undefined && input != undefined) {
            mask = IMask(input, options);
            mask.value = value.text;
            mask.on('accept', () => {
                const newValue = { ...value, text: maybeCapitalized(mask!.value, widget) };
                value = newValue;
                widget.onValueSet(context, newValue);
            });
        }
    });

    onDestroy(() => {
        mask = undefined;
    });

    $effect.pre(() => {
        mask?.updateValue();
    });

    $effect(() => {
        if (opts != undefined) mask?.updateOptions(opts);
    });

    widget.updateMaskValue = (text) => {
        if (mask) mask.value = text;
    };

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) => {
        const newValue = { ...value, chosen: e.currentTarget.value as I };
        value = newValue;
        widget.onValueSet(context, newValue);
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block left">
            {#if widget.textArea(context)}
            <textarea
                autocomplete={widget.autocomplete(context)}
                inputmode={widget.inputmode(context)}
                enterkeyhint={widget.enterkeyhint(context)}
                autocapitalize={widget.autocapitalize(context)}
                placeholder={labelAndStar(widget, context, t)}
                class="form-control"
                bind:this={textarea}
                value={value.text}
                oninput={() => {
					if (textarea) {
                        const newValue = { ...value, text: maybeCapitalized(textarea?.value ?? value.text, widget) }
                        value = newValue;
                        widget.onValueSet(context, newValue);
                    }
				}}
                disabled={widget.lock(context)}
                style="height: 100px"
            ></textarea>
            {:else if options !== undefined}
                <input
                    type={widget.type(context)}
                    inputmode={widget.inputmode(context)}
                    enterkeyhint={widget.enterkeyhint(context)}
                    autocapitalize={widget.autocapitalize(context)}
                    autocomplete={widget.autocomplete(context)}
                    placeholder={labelAndStar(widget, context, t)}
                    class="form-control"
                    bind:this={input}
                    disabled={widget.lock(context)}
                />
            {:else}
                <input
                    type={widget.type(context)}
                    inputmode={widget.inputmode(context)}
                    enterkeyhint={widget.enterkeyhint(context)}
                    autocapitalize={widget.autocapitalize(context)}
                    autocomplete={widget.autocomplete(context)}
                    placeholder={labelAndStar(widget, context, t)}
                    class="form-control"
                    bind:this={input}
                    value={value.text}
                    oninput={() => {
                        if (input) {
                            const newValue = { ...value, text: maybeCapitalized(input?.value ?? value.text, widget) }
                            value = newValue;
                            widget.onValueSet(context, newValue);
                        }
                    }}
                    disabled={widget.lock(context)}
                />
            {/if}
            <label for="">{labelAndStar(widget, context, t)}</label>
        </label>
        <select
            class="form-select right"
            id={labelAndStar(widget, context, t)}
            value={value.chosen}
            onchange={onChange}
        >
            {#each widget.options as moznost}
                <option value={moznost}>{widget.get(t, moznost)}</option>
            {/each}
        </select>
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger help-block">{widget.onError(t, context)}</span>
    {/if}
</div>

<style>
    .left {
        width: 80%;
        max-width: 80%;
    }

    .right {
        width: 20%;
    }
</style>
