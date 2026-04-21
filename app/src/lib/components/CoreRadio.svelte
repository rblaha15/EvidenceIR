<script generics="C, U, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Arr, type Get, labelAndStar, type Labels, type Lock, type Required, type WidgetType } from '$lib/forms/Widget';
    import { Eraser } from '@lucide/svelte';
    import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
    import { Button } from "$lib/components/ui/button";
    import type { Snippet } from "svelte";

    interface Props {
        t: Translations;
        widget: Required<C, U, WidgetType, boolean> & Lock<C> & Labels<I> & {
            options: Get<C, Arr<I>>;
        };
        context: C;
        value: U;
        chosenValue: I | null;
        setChosenValue: (value: I | null) => U;
        showError: boolean;
        trailingContent?: Snippet<[item: I]>
        id?: string;
    }

    const defaultId = $props.id();

    let {
        t, widget, value: widgetValue = $bindable(), context, chosenValue: value, setChosenValue, showError = $bindable(),
        trailingContent, id = defaultId,
    }: Props = $props();

    const chosen = {
        get value() {
            return value as string | null ?? '';
        },
        set value(chosen) {
            const newValue = setChosenValue(chosen as I || null)
            widgetValue = newValue;
            widget.onValueSet(context, newValue);
        },
    };
    const invalid = $derived(widget.isError(context, widgetValue) && showError);
</script>

<Card class="w-full relative" size="sm">
    {#if !widget.required(context)}
        <Button variant="ghost" size="icon" onclick={() => chosen.value = ''}
                class="absolute right-2 top-2">
            <Eraser />
            <span class="sr-only">{t.widget.clearSelection}</span>
        </Button>
    {/if}
    <CardContent>
        <FieldSet>
            {#if labelAndStar(widget, context, t)}
                <FieldLabel data-invalid={invalid}>{labelAndStar(widget, context, t)}</FieldLabel>
            {/if}
            <RadioGroup bind:value={chosen.value}>
                {#each widget.options(context) as item}
                    <FieldGroup>
                        <Field data-invalid={invalid} orientation="horizontal">
                            <RadioGroupItem value={item} aria-invalid={invalid} id="{id}-{item}" />
                            <FieldLabel class="font-normal" for="{id}-{item}">{widget.get(t, item)}</FieldLabel>
                        </Field>
                        {@render trailingContent?.(item)}
                    </FieldGroup>
                {/each}
            </RadioGroup>
            {#if invalid}
                <FieldError>{widget.onError(t, context)}</FieldError>
            {/if}
        </FieldSet>
    </CardContent>
</Card>