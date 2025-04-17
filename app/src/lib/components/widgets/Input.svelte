<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget, nazevSHvezdou } from '$lib/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

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
</script>

{#if widget.show(data)}
    <label class="form-floating d-block mb-1">
        {#if widget.textArea(data)}
            <textarea
                autocomplete={widget.autocomplete(data)}
                placeholder={nazevSHvezdou(widget, data, t)}
                class="form-control"
                bind:this={textarea}
                value={widget.value}
                oninput={() => {
					if (textarea) widget.setValue(data, maybeCapitalized(textarea.value, widget));
				}}
                disabled={widget.lock(data)}
                style="height: 100px"
            ></textarea>
        {:else if options !== undefined}
            <input
                type={widget.type(data, t)}
                autocomplete={widget.autocomplete(data)}
                placeholder={nazevSHvezdou(widget, data, t)}
                class="form-control"
                bind:this={input}
                disabled={widget.lock(data)}
            />
        {:else}
            <input
                type={widget.type(data, t)}
                autocomplete={widget.autocomplete(data)}
                placeholder={nazevSHvezdou(widget, data, t)}
                class="form-control"
                bind:this={input}
                value={widget.value}
                oninput={() => {
					if (input) widget.setValue(data, maybeCapitalized(input.value, widget));
				}}
                disabled={widget.lock(data)}
            />
        {/if}
        <label for="">{nazevSHvezdou(widget, data, t)}</label>
    </label>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}

    <div class="mb-2"></div>
{/if}
