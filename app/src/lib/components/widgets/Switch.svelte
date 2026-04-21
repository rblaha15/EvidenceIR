<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type SwitchWidget } from '$lib/forms/Widget';
    import { Toggle } from "$lib/components/ui/toggle";
    import { Field, FieldError, FieldTitle } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";

    interface Props {
        t: Translations;
        widget: SwitchWidget<C>;
        context: C;
        value: boolean;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);
    const onPressedChange = (option: boolean) => (checked2: boolean) => {
        const newValue = option == checked2;
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<Card class="w-full" size="sm">
    <CardContent>
        <Field data-invalid={invalid} orientation="horizontal">
            <FieldTitle>{widget.label(t, context)}</FieldTitle>
            <Toggle aria-invalid={invalid} onPressedChange={onPressedChange(false)} pressed={!value}>
                {widget.options(t)[0]}
            </Toggle>
            <Toggle aria-invalid={invalid} onPressedChange={onPressedChange(true)} pressed={value}>
                {widget.options(t)[1]}
            </Toggle>
        </Field>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>