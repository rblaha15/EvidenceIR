<script generics="C, U, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { type Snippet, untrack } from 'svelte';
    import {
        type Arr,
        type Compact,
        type Get,
        labelAndStar,
        type Labels,
        type Lock,
        type Required,
        type WidgetType
    } from '$lib/forms/Widget';
    import { NativeSelect, NativeSelectOption } from "$lib/components/ui/native-select";
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";

    interface Props {
        t: Translations;
        widget: Required<C, U, WidgetType, boolean> & Compact<C> & Lock<C> & Labels<I> & {
            options: Get<C, Arr<I>>;
            otherOptions: Get<C, Arr<I>>;
        };
        context: C;
        value: U;
        chosenValue: I | null;
        setChosenValue: (value: I | null) => U;
        showError: boolean;
        trailingContent?: Snippet;
        id?: string;
    }

    const defaultId = $props.id();

    let {
        t, widget, value: widgetValue = $bindable(), context, chosenValue: value, setChosenValue, showError = $bindable(),
        trailingContent, id = defaultId,
    }: Props = $props();

    const chosen = {
        get value() {
            return value as string | null ?? 'notChosen';
        },
        set value(chosen) {
            const newValue = setChosenValue(chosen as I || null)
            widgetValue = newValue;
            widget.onValueSet(context, newValue);
        },
    };

    let other = $state([] as Arr<I>);
    let options = $state([] as Arr<I>);
    const onChange: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options = [...options, ...other];
            other = [];
            setTimeout(() => {
                target.value = chosen.value;
                target.showPicker();
            });
        } else {
            chosen.value = option;
            showError = true;
        }
    };
    $effect(() => {
        options = widget.options(context);
        other = widget.otherOptions(context);
        untrack(() => {
            if (value && other.includes(value)) {
                options = [...options, ...other];
                other = [];
            }
        });
    });

    const invalid = $derived(widget.isError(context, widgetValue) && showError);
</script>

<Card class="w-full" size="sm">
    <CardContent>
        <FieldGroup>
            <Field data-invalid={invalid} orientation={widget.compact(context) ? 'horizontal' : 'responsive'}>
                <FieldLabel for={id}>{labelAndStar(widget, context, t)}</FieldLabel>
                <NativeSelect aria-invalid={invalid} disabled={widget.lock(context)} {id}
                              onchange={onChange} value={chosen.value}>

                    <NativeSelectOption class="hidden" value='notChosen'>{t.widget.notChosen}</NativeSelectOption>
                    {#each options as option}
                        <NativeSelectOption value={option}>{widget.get(t, option)}</NativeSelectOption>
                    {/each}
                    {#if other.length}
                        <NativeSelectOption value='otherOptions'>{t.widget.otherOptions}…</NativeSelectOption>
                    {/if}
                </NativeSelect>
            </Field>
            {@render trailingContent?.()}
        </FieldGroup>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>