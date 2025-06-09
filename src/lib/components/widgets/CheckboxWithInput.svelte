<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CheckboxWithInputWidget, labelAndStar } from '$lib/Widget.svelte.js';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: CheckboxWithInputWidget<D>;
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

    const maybeCapitalized = (value: string, vec: CheckboxWithInputWidget<D>): string =>
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

    const onClick = () => {
        widget.mutateValue(data, v => ({ ...v, checked: !v.checked }));
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button class="input-group-text input-group-input" onclick={onClick} aria-labelledby="label-{uid}" tabindex="-1">
            <input class="form-check-input m-0" type="checkbox" role="button" disabled={widget.lock(data)} bind:checked={widget.value.checked} />
        </button>
        <label class="form-floating d-block" id="label-{uid}">
            {#if !widget.value.checked}
                <input type="text" placeholder={labelAndStar(widget, data, t)} readonly
                       onclick={onClick} class="form-control shadow-none input-group-text"
                       role="button" disabled={widget.lock(data)} tabindex="-1" />
            {:else if widget.textArea(data)}
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
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}
</div>
