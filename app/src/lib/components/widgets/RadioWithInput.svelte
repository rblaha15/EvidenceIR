<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type RadioWithInputWidget, type RaI } from '$lib/forms/Widget';
    import { Field, FieldLabel } from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";
    import CoreRadio from "$lib/components/CoreRadio.svelte";

    interface Props {
        t: Translations;
        widget: RadioWithInputWidget<C, I>;
        context: C;
        value: RaI<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const id = $props.id();

    const other = $derived(widget.options(context).at(-1)!);
</script>

{#snippet trailingContent(item: I)}
    {#if item === other && value.chosen === other}
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
                    const newValue = { chosen: other, text: e.currentTarget.value ?? value.text };
                    value = newValue;
                    widget.onValueSet(context, newValue);
                }}
                disabled={widget.lock(context)}
            />
        </Field>
    {/if}
{/snippet}

<CoreRadio
    bind:showError bind:value chosenValue={value.chosen} {context} setChosenValue={chosen => ({ ...value, chosen })} {t} {widget}
    {trailingContent}
/>