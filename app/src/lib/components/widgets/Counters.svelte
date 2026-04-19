<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { Button } from '$lib/components/ui/button';
    import { type CountersWidget, type Rec } from '$lib/forms/Widget';
    import { Minus, Plus } from "@lucide/svelte";
    import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "$lib/components/ui/button-group";
    import { Field, FieldError, FieldGroup, FieldLegend, FieldSet, FieldTitle } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";

    interface Props {
        t: Translations;
        widget: CountersWidget<C, I>;
        context: C;
        value: Rec<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const sum = $derived(value.getValues().reduce((v, acc) => acc + v, 0));

    const uid = $props.id();
    const inc = (option: I) => () => {
        const newValue = { ...value, [option]: value[option] + 1 };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const dec = (option: I) => () => {
        const newValue = { ...value, [option]: value[option] - 1 };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<Card class="min-w-field" size="sm">
    <CardContent>
        <FieldSet>
            <FieldLegend data-invalid={invalid}>{widget.label(t, context)}</FieldLegend>
            <FieldGroup class="gap-4">
                {#each value.entries() as [option, number]}
                    <Field data-invalid={invalid} orientation="horizontal">
                        <ButtonGroup>
                            <Button size="icon" onclick={dec(option)} disabled={number === 0}>
                                <Minus />
                                <span class="sr-only">Decrement</span>
                            </Button>
                            <ButtonGroupSeparator />
                            <ButtonGroupText class="border-0 min-w-9 h-9 justify-around">{number}</ButtonGroupText>
                            <ButtonGroupSeparator />
                            <Button size="icon" onclick={inc(option)} disabled={sum === widget.max(context)}>
                                <Plus />
                                <span class="sr-only">Increment</span>
                            </Button>
                        </ButtonGroup>
                        <FieldTitle>{widget.get(t, option)}</FieldTitle>
                    </Field>
                {/each}
            </FieldGroup>
            {#if invalid}
                <FieldError>{widget.onError(t, context)}</FieldError>
            {/if}
        </FieldSet>
    </CardContent>
</Card>