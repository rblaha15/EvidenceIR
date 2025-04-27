<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget, labelAndStar } from '$lib/Widget.svelte.js';
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
    <div class="input-group">
        <label class="form-floating d-block">
            {#if widget.textArea(data)}
            <textarea
                autocomplete={widget.autocomplete(data)}
                inputmode={widget.inputmode(data)}
                enterkeyhint={widget.enterkeyhint(data)}
                autocapitalize={widget.autocapitalize(data)}
                placeholder={labelAndStar(widget, data, t)}
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
                    value={widget.value}
                    oninput={() => {
					if (input) widget.setValue(data, maybeCapitalized(input.value, widget));
				}}
                    disabled={widget.lock(data)}
                />
            {/if}
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        {#if widget.suffix(data, t)}
            <span class="input-group-text">{t.get(widget.suffix(data, t) ?? '')}</span>
        {/if}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block mt-1">{t.get(widget.onError(data, t))}</span>
    {/if}

    <div class="mb-3"></div>
{/if}
