<script generics="C, I extends string" lang="ts">
    import CoreChooser from '$lib/components/forms/CoreChooser.svelte';
    import { Field, FieldLabel } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import type { ChooserWithInputWidget, RaI } from '$lib/forms/Widget';
    import type { Translations } from '$lib/translations';

    interface Props {
        t: Translations;
        widget: ChooserWithInputWidget<C, I>;
        context: C;
        value: RaI<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const id = $props.id();
</script>

{#snippet trailingContent()}
    {#if !widget.hideOther(value.chosen, context)}
        <Field class="w-auto" orientation="responsive">
            <FieldLabel class="grow-0!" for="input-{id}">{widget.otherLabel(t, context)}</FieldLabel>
            <Input
                class="grow"
                type={widget.type(context)}
                inputmode={widget.inputmode(context)}
                enterkeyhint={widget.enterkeyhint(context)}
                autocapitalize={widget.autocapitalize(context)}
                id="input-{id}"
                value={value.text}
                oninput={e => {
                    const newValue = { chosen: value.chosen, text: e.currentTarget.value ?? value.text };
                    value = newValue;
                    widget.onValueSet(context, newValue);
                }}
                disabled={widget.lock(context)}
            />
        </Field>
    {/if}
{/snippet}

<CoreChooser
    bind:showError bind:value chosenValue={value.chosen} {context} setChosenValue={chosen => ({ ...value, chosen })} {t}
    {trailingContent}
    {widget}
/>