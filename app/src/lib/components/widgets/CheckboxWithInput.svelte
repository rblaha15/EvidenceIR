<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CheckboxWithInputWidget, type ChI, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: CheckboxWithInputWidget<C>;
        context: C;
        value: ChI;
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

    const maybeCapitalized = (value: string, vec: CheckboxWithInputWidget<C>): string =>
        vec.capitalize(context) ? value.toUpperCase() : value;

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

    const onClick = () => {
        const newValue = { ...value, checked: !value.checked };
        value = newValue;
        widget.onValueSet(context, newValue);
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button class="input-group-text input-group-input" onclick={onClick} aria-labelledby="label-{uid}" tabindex="-1">
            <input class="form-check-input m-0" type="checkbox" role="button" disabled={widget.lock(context)} checked={value.checked} onclick={onClick} />
        </button>
        <label class="form-floating d-block" id="label-{uid}">
            {#if !value.checked}
                <input type="text" placeholder={labelAndStar(widget, context, t)} readonly
                       onclick={onClick} class="form-control shadow-none input-group-text"
                       role="button" disabled={widget.lock(context)} tabindex="-1" />
            {:else if widget.textArea(context)}
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
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger help-block">{widget.onError(t, context)}</span>
    {/if}
</div>
