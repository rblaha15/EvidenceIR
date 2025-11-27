<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { InputWithSuggestionsWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: InputWithSuggestionsWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const maybeCapitalized = (value: string, widget: InputWithSuggestionsWidget<D>): string =>
        widget.capitalize(data) ? value.toUpperCase() : value;

    const suggestions = $derived(widget.suggestions(t, data));

    let input = $state<HTMLInputElement>();

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block">
            <input
                list="datalist-{uid}"
                type={widget.type(data)}
                inputmode={widget.inputmode(data)}
                enterkeyhint={widget.enterkeyhint(data)}
                autocapitalize={widget.autocapitalize(data)}
                placeholder={labelAndStar(widget, data, t)}
                class="form-control"
                bind:this={input}
                value={widget.value}
                oninput={() => {
                if (input) widget.setValue(data, maybeCapitalized(input.value, widget));
            }}
            />
            <datalist id="datalist-{uid}">
                {#each $suggestions as suggestion}
                    <option value={suggestion}>{suggestion}</option>
                {/each}
            </datalist>
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        {#if widget.suffix(t, data)}
            <span class="input-group-text">{widget.suffix(t, data) ?? ''}</span>
        {/if}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{widget.onError(t, data)}</span>
    {/if}
</div>
