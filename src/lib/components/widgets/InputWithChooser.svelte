<script generics="D, I extends TranslationReference" lang="ts">
    import type { TranslationReference, Translations } from '$lib/translations';
    import { InputWithChooserWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: InputWithChooserWidget<D, I>;
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

    const maybeCapitalized = (value: string, widget: InputWithChooserWidget<D, I>): string =>
        widget.capitalize(data) ? value.toUpperCase() : value;

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
            mask.value = widget.value.text;
            mask.on('accept', () => widget.mutateValue(data, v => (
                { ...v, text: maybeCapitalized(mask!.value, widget) }
            )));
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
    ) => widget.mutateValue(data, v => (
        { ...v, chosen: e.currentTarget.value as I }
    ));
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block left">
            {#if widget.textArea(data)}
            <textarea
                autocomplete={widget.autocomplete(data)}
                inputmode={widget.inputmode(data)}
                enterkeyhint={widget.enterkeyhint(data)}
                autocapitalize={widget.autocapitalize(data)}
                placeholder={labelAndStar(widget, data, t)}
                class="form-control"
                bind:this={textarea}
                value={widget.value.text}
                oninput={() => {
					if (textarea) widget.mutateValue(data, v => (
                        { ...v, text: maybeCapitalized(textarea?.value ?? v.text, widget) }
                    ));
				}}
                disabled={widget.lock(data)}
                style="height: 100px"
            ></textarea>
            {:else if options !== undefined}
                <input
                    type={widget.type(data, t)}
                    inputmode={widget.inputmode(data)}
                    enterkeyhint={widget.enterkeyhint(data)}
                    autocapitalize={widget.autocapitalize(data)}
                    autocomplete={widget.autocomplete(data)}
                    placeholder={labelAndStar(widget, data, t)}
                    class="form-control"
                    bind:this={input}
                    disabled={widget.lock(data)}
                />
            {:else}
                <input
                    type={widget.type(data, t)}
                    inputmode={widget.inputmode(data)}
                    enterkeyhint={widget.enterkeyhint(data)}
                    autocapitalize={widget.autocapitalize(data)}
                    autocomplete={widget.autocomplete(data)}
                    placeholder={labelAndStar(widget, data, t)}
                    class="form-control"
                    bind:this={input}
                    value={widget.value.text}
                    oninput={() => {
                        if (input) widget.mutateValue(data, v => (
                            { ...v, text: maybeCapitalized(input?.value ?? v.text, widget) }
                        ));
                    }}
                    disabled={widget.lock(data)}
                />
            {/if}
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        <select
            class="form-select right"
            id={labelAndStar(widget, data, t)}
            value={widget.value.chosen}
            onchange={onChange}
        >
            {#each widget.options as moznost}
                <option value={moznost}>{t.get(moznost)}</option>
            {/each}
        </select>
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
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
