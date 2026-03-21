<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';

    interface Props {
        t: Translations;
        widget: InputWidget<C>;
        context: C;
        value: string;
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

    const maybeCapitalized = (value: string, vec: InputWidget<C>): string =>
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
            mask.value = value;
            mask.on('accept', () => {
                const newValue = maybeCapitalized(mask!.value, widget);
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
        value = '';
        widget.onValueSet(context, '');
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class={["d-block w-100", {'form-floating': !widget.placeholder(t, context)}]}>
            {#if widget.textArea(context)}
            <textarea
                autocomplete={widget.autocomplete(context)}
                inputmode={widget.inputmode(context)}
                enterkeyhint={widget.enterkeyhint(context)}
                autocapitalize={widget.autocapitalize(context)}
                placeholder={widget.placeholder(t, context) || labelAndStar(widget, context, t)}
                class={['form-control', "lh-base"]}
                bind:this={textarea}
                {value}
                oninput={() => {
					if (textarea) {
                        const newValue = maybeCapitalized(textarea.value, widget);
                        value = newValue;
                        widget.onValueSet(context, newValue);
                    }
				}}
                disabled={widget.lock(context)}
                style="height: 150px"
            ></textarea>
            {:else if options !== undefined}
                <input
                    type={widget.type(context)}
                    inputmode={widget.inputmode(context)}
                    enterkeyhint={widget.enterkeyhint(context)}
                    autocapitalize={widget.autocapitalize(context)}
                    autocomplete={widget.autocomplete(context)}
                    placeholder={widget.placeholder(t, context) || labelAndStar(widget, context, t)}
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
                    placeholder={widget.placeholder(t, context) || labelAndStar(widget, context, t)}
                    class="form-control"
                    bind:this={input}
                    value={value}
                    oninput={() => {
					if (input) {
                        const newValue = maybeCapitalized(input.value, widget)
                        value = newValue;
                        widget.onValueSet(context, newValue);
                    }
				}}
                    disabled={widget.lock(context)}
                />
            {/if}
            {#if widget.label(t, context)}
                <label for="">{labelAndStar(widget, context, t)}</label>
            {/if}
            <button aria-label={t.widget.clearSelection} class="btn py-1 px-2 m-1"
                    class:d-none={!value || widget.type(context) !== 'date' || widget.required(context)} onclick={onClick}>
                <Icon icon="clear" />
            </button>
        </label>
        {#if widget.suffix(t, context)}
            <span class="input-group-text">{widget.suffix(t, context) ?? ''}</span>
        {/if}
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger help-block">{widget.onError(t, context)}</span>
    {/if}
</div>

<style>
    .form-floating > button {
        position: absolute;
        right: calc(var(--bs-border-width) + 2rem);
        top: calc(50% - var(--bs-body-font-size));
    }
</style>