<script generics="C, U" lang="ts">
    import type { Translations } from '$lib/translations';
    import {
        type BaseInput,
        type AdvancedInput,
        labelAndStar,
        type Lock,
        type Required,
        Widget,
    } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount, type Snippet, untrack } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { readable } from 'svelte/store';
    import type { ClassValue } from 'svelte/elements';

    type GenericInputWidget<C, U> = Widget<C, U> & BaseInput<C, U> & ({
        textArea?: undefined;
        autocomplete?: undefined;
        updateMaskValue?: undefined;
        maskOptions?: undefined;
        capitalize?: undefined;
        placeholder?: undefined;
        suffix?: undefined;
        suggestions?: undefined;
    } | AdvancedInput<C, U>) & Lock<C, U> & Required<C, U, boolean>;

    interface Props {
        t: Translations;
        widget: GenericInputWidget<C, U>;
        context: C;
        value: U;
        textValue: string;
        setTextValue: (value: string) => U;
        leadingContent?: Snippet;
        coreContent?: Snippet<[Snippet]>;
        trailingContent?: Snippet;
        uid?: string;
        labelClass?: ClassValue;
    }

    const defaultId = $props.id();

    let {
        t, widget, value: widgetValue = $bindable(), context, textValue: value, setTextValue,
        leadingContent, coreContent = defaultCore, trailingContent, uid = defaultId, labelClass,
    }: Props = $props();

    type MyOpts = {
        lazy: boolean;
        overwrite: boolean;
        mask: string;
        definitions: {
            [key: string]: RegExp;
        };
        value?: string;
    };

    const suggestions = $derived(widget.suggestions?.(t, context) ?? readable([]));

    const maybeCapitalized = (value: string, widget: GenericInputWidget<C, U>): string =>
        widget.capitalize?.(context) ? value.toUpperCase() : value;

    let input = $state<HTMLInputElement>();
    let textarea = $state<HTMLTextAreaElement>();
    let mask = $state<InputMask<MyOpts>>();

    let opts = $derived(widget.maskOptions?.(context));

    let options = $derived(
        !opts
            ? undefined
            : ({
                lazy: true,
                overwrite: true,
                ...opts,
            } as MyOpts),
    );

    const setValueAndUpdate = (text: string) => {
        const newValue = setTextValue(maybeCapitalized(text, widget));
        widgetValue = newValue;
        widget.onValueSet(context, newValue);
    };

    onMount(() => {
        if (options != undefined && input != undefined) {
            mask = IMask(input, options);
            mask.value = value;
            mask.on('accept', () => setValueAndUpdate(mask!.value));
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

    $effect(() => {
        value;
        untrack(() => {
            if (mask) mask.value = value;
        })
    });
    const onClick = () => setValueAndUpdate('');
</script>

{#snippet defaultCore(field: Snippet)}
    {@render field()}
{/snippet}

{#snippet field()}
    {#if widget.textArea?.(context)}
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
                if (textarea) setValueAndUpdate(textarea.value);
            }}
            disabled={widget.lock(context)}
            style="height: 150px"
        ></textarea>
    {:else if options !== undefined}
        <input
            list="suggestions-{uid}"
            type={widget.type(context)}
            inputmode={widget.inputmode(context)}
            enterkeyhint={widget.enterkeyhint(context)}
            autocapitalize={widget.autocapitalize(context)}
            autocomplete={widget.autocomplete?.(context)}
            placeholder={widget.placeholder?.(t, context) || labelAndStar(widget, context, t)}
            class="form-control"
            bind:this={input}
            disabled={widget.lock(context)}
        />
    {:else}
        <input
            list="suggestions-{uid}"
            type={widget.type(context)}
            inputmode={widget.inputmode(context)}
            enterkeyhint={widget.enterkeyhint(context)}
            autocapitalize={widget.autocapitalize(context)}
            autocomplete={widget.autocomplete?.(context)}
            placeholder={widget.placeholder?.(t, context) || labelAndStar(widget, context, t)}
            class="form-control"
            bind:this={input}
            value={value}
            oninput={() => {
                if (input) setValueAndUpdate(input.value);
            }}
            disabled={widget.lock(context)}
        />
    {/if}
{/snippet}

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class={['d-block', {'form-floating': !widget.placeholder?.(t, context)}, labelClass]} id="label-{uid}">
            {@render leadingContent?.()}
            {@render coreContent(field)}

            {#if $suggestions.length}
                <datalist id="suggestions-{uid}">
                    {#each $suggestions as suggestion}
                        <option value={suggestion}>{suggestion}</option>
                    {/each}
                </datalist>
            {/if}
            {#if widget.label(t, context)}
                <label for="">{labelAndStar(widget, context, t)}</label>
            {/if}
            <button aria-label={t.widget.clearSelection} class="btn py-1 px-2 m-1"
                    class:d-none={!value || widget.type(context) !== 'date' || widget.required(context)} onclick={onClick}>
                <Icon icon="clear" />
            </button>
        </label>
        {#if widget.suffix?.(t, context)}
            <span class="input-group-text">{widget.suffix(t, context) ?? ''}</span>
        {/if}
        {@render trailingContent?.()}
    </div>

    {#if widget.showError(context, widgetValue)}
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