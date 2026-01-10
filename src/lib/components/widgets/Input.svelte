<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';

    interface Props {
        t: Translations;
        widget: InputWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    type MyOpts = {
        lazy: boolean;
        overwrite: boolean;
        mask: string;
        definitions: {
            [key: string]: RegExp;
        };
        value?: string;
    };

    const maybeCapitalized = (value: string, vec: InputWidget<D>): string =>
        vec.capitalize(data) ? value.toUpperCase() : value;

    let input = $state<HTMLInputElement>();
    let textarea = $state<HTMLTextAreaElement>();
    let mask = $state<InputMask<MyOpts>>();

    let opts = $derived(widget.maskOptions(data));

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
            mask.value = widget.value;
            mask.on('accept', () => widget.setValue(data, maybeCapitalized(mask!.value, widget)));
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
        widget.setValue(data, '');
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class={["d-block w-100", {'form-floating': !widget.placeholder(t, data)}]}>
            {#if widget.textArea(data)}
            <textarea
                autocomplete={widget.autocomplete(data)}
                inputmode={widget.inputmode(data)}
                enterkeyhint={widget.enterkeyhint(data)}
                autocapitalize={widget.autocapitalize(data)}
                placeholder={widget.placeholder(t, data) || labelAndStar(widget, data, t)}
                class={['form-control', "lh-base"]}
                bind:this={textarea}
                value={widget.value}
                oninput={() => {
					if (textarea) widget.setValue(data, maybeCapitalized(textarea.value, widget));
				}}
                disabled={widget.lock(data)}
                style="height: 150px"
            ></textarea>
            {:else if options !== undefined}
                <input
                    type={widget.type(data)}
                    inputmode={widget.inputmode(data)}
                    enterkeyhint={widget.enterkeyhint(data)}
                    autocapitalize={widget.autocapitalize(data)}
                    autocomplete={widget.autocomplete(data)}
                    placeholder={widget.placeholder(t, data) || labelAndStar(widget, data, t)}
                    class="form-control"
                    bind:this={input}
                    disabled={widget.lock(data)}
                />
            {:else}
                <input
                    type={widget.type(data)}
                    inputmode={widget.inputmode(data)}
                    enterkeyhint={widget.enterkeyhint(data)}
                    autocapitalize={widget.autocapitalize(data)}
                    autocomplete={widget.autocomplete(data)}
                    placeholder={widget.placeholder(t, data) || labelAndStar(widget, data, t)}
                    class="form-control"
                    bind:this={input}
                    value={widget.value}
                    oninput={() => {
					if (input) widget.setValue(data, maybeCapitalized(input.value, widget));
				}}
                    disabled={widget.lock(data)}
                />
            {/if}
            {#if widget.label(t, data)}
                <label for="">{labelAndStar(widget, data, t)}</label>
            {/if}
            <button aria-label={t.widget.clearSelection} class="btn py-1 px-2 m-1"
                    class:d-none={!widget.value || widget.type(data) !== 'date' || widget.required(data)} onclick={onClick}>
                <Icon icon="clear" />
            </button>
        </label>
        {#if widget.suffix(t, data)}
            <span class="input-group-text">{widget.suffix(t, data) ?? ''}</span>
        {/if}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{widget.onError(t, data)}</span>
    {/if}
</div>

<style>
    .form-floating > button {
        position: absolute;
        right: calc(var(--bs-border-width) + 2rem);
        top: calc(50% - var(--bs-body-font-size));
    }
</style>