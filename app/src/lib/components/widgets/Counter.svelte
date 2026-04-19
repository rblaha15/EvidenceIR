<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { CounterWidget } from '$lib/forms/Widget';
    import { Minus, Plus } from "@lucide/svelte";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Field, FieldError, FieldTitle } from "$lib/components/ui/field";
    import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "$lib/components/ui/button-group";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        t: Translations;
        widget: CounterWidget<C>;
        context: C;
        value: number;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const uid = $props.id();
    const inc = () => {
        const newValue = value + 1;
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const dec = () => {
        const newValue = value - 1;
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<Card class="min-w-field" size="sm">
    <CardContent>
        <Field data-invalid={invalid} orientation="horizontal">
            <FieldTitle>{widget.label(t, context)}</FieldTitle>
            <ButtonGroup>
                {#if !widget.lock(context)}
                    <Button size="icon-lg" onclick={dec} disabled={value === widget.min(context)}>
                        <Minus />
                        <span class="sr-only">Decrement</span>
                    </Button>
                    <ButtonGroupSeparator />
                {/if}
                <ButtonGroupText class="border-0 min-w-10 h-10 justify-around">{value}</ButtonGroupText>
                {#if !widget.lock(context)}
                    <ButtonGroupSeparator />
                    <Button size="icon-lg" onclick={inc} disabled={value === widget.max(context)}>
                        <Plus />
                        <span class="sr-only">Increment</span>
                    </Button>
                {/if}
            </ButtonGroup>
        </Field>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>