<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { InputWithSuggestionsWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: InputWithSuggestionsWidget<C>;
        context: C;
        value: string;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();

    const maybeCapitalized = (value: string, widget: InputWithSuggestionsWidget<C>): string =>
        widget.capitalize(context) ? value.toUpperCase() : value;

    const suggestions = $derived(widget.suggestions(t, context));

    let input = $state<HTMLInputElement>();

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block">
            <input
                list="datalist-{uid}"
                type={widget.type(context)}
                inputmode={widget.inputmode(context)}
                enterkeyhint={widget.enterkeyhint(context)}
                autocapitalize={widget.autocapitalize(context)}
                placeholder={labelAndStar(widget, context, t)}
                class="form-control"
                bind:this={input}
                value={value}
                oninput={() => {
                    if (input) {
                        const newValue = maybeCapitalized(input.value, widget);
                        value = newValue;
                        widget.onValueSet(context, newValue);
                    }
                }}
            />
            <datalist id="datalist-{uid}">
                {#each $suggestions as suggestion}
                    <option value={suggestion}>{suggestion}</option>
                {/each}
            </datalist>
            <label for="">{labelAndStar(widget, context, t)}</label>
        </label>
        {#if widget.suffix(t, context)}
            <span class="input-group-text">{widget.suffix(t, context) ?? ''}</span>
        {/if}
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger help-block">{widget.onError(t, context)}</span>
    {/if}
</div>
