<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type RadioWidget } from '$lib/forms/Widget';
    import { Eraser } from '@lucide/svelte';
    import { Field, FieldError, FieldLabel, FieldSet } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        t: Translations;
        widget: RadioWidget<C, I>;
        context: C;
        value: I | null;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const chosen = {
        get value() {
            return value as string | null ?? '';
        },
        set value(chosen) {
            const newValue = chosen as I || null
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        },
    };
    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

<Card size="sm" class="relative min-w-field">
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
                    <Field data-invalid={invalid} orientation="horizontal">
                        <RadioGroupItem value={item} aria-invalid={invalid} id="{id}-{item}" />
                        <FieldLabel class="font-normal" for="{id}-{item}">{widget.get(t, item)}</FieldLabel>
                    </Field>
                {/each}
            </RadioGroup>
            {#if invalid}
                <FieldError>{widget.onError(t, context)}</FieldError>
            {/if}
        </FieldSet>
    </CardContent>
</Card>