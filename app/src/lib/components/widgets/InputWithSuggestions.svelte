<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { InputWithSuggestionsWidget, labelAndStar } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: InputWithSuggestionsWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const maybeCapitalized = (value: string, widget: InputWithSuggestionsWidget<D>): string =>
        widget.capitalize(data) ? value.toUpperCase() : value;

    let input = $state<HTMLInputElement>();

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block">
            <input
                list="datalist-{uid}"
                type={widget.type(data, t)}
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
                {#each widget.suggestions(data) as suggestion}
                    <option value={t.get(suggestion)}>{t.get(suggestion)}</option>
                {/each}
            </datalist>
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        {#if widget.suffix(data, t)}
            <span class="input-group-text">{t.get(widget.suffix(data, t) ?? '')}</span>
        {/if}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}
</div>
