<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Arr, labelAndStar, type MultiCheckboxWidget } from '$lib/forms/Widget';
    import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<C, I>;
        context: C;
        value: Arr<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const weights = $derived((i: I) => widget.weights(context, i));
    const count = $derived(value.sumBy(weights));
    const options = $derived(widget.options(context));
    const chosen = {
        get value() {
            return value;
        },
        set value(chosen) {
            value = chosen;
            widget.onValueSet(context, chosen);
            showError = true;
        },
    };

    const checked = (item: I) => value.includes(item);
    const disabled = (item: I) => widget.lock(context) || !checked(item) && count + weights(item) > widget.max(context);
    const onCheckedChange = (item: I) => (checked: boolean) => {
        chosen.value = value.toggle(item, checked);
    };
    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

<Card class="py-4">
    <CardContent class="px-4">
        <FieldSet>
            <FieldLegend data-invalid={invalid} variant="label">{labelAndStar(widget, context, t)}</FieldLegend>
            <FieldGroup data-slot="checkbox-group">
                {#each options as item}
                    <Field data-invalid={invalid} orientation="horizontal">
                        <Checkbox checked={checked(item)} disabled={disabled(item)} onCheckedChange={onCheckedChange(item)}
                                  aria-invalid={invalid} id="{id}-{item}" />

                        <FieldLabel class="font-normal" for="{id}-{item}">{widget.get(t, item)}</FieldLabel>
                    </Field>
                {/each}
            </FieldGroup>
            {#if invalid}
                <FieldError>{widget.onError(t, context)}</FieldError>
            {/if}
        </FieldSet>
    </CardContent>
</Card>