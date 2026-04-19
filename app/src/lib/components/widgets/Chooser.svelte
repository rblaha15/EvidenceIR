<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { untrack } from 'svelte';
    import { type Arr, type ChooserWidget, labelAndStar } from '$lib/forms/Widget';
    import { Label } from "$lib/components/ui/label";
    import { NativeSelect, NativeSelectOption } from "$lib/components/ui/native-select";
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";

    interface Props {
        t: Translations;
        widget: ChooserWidget<C, I>;
        context: C;
        value: I;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

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
                target.value = value || 'notChosen';
                target.showPicker();
            });
        } else {
            value = option as I;
            widget.onValueSet(context, option as I);
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

    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

<Card class="min-w-field" size="sm">
    <CardContent>
        <FieldGroup>
            <Field data-invalid={invalid} orientation={widget.compact(context) ? 'horizontal' : 'responsive'}>
                <FieldLabel for={id}>{labelAndStar(widget, context, t)}</FieldLabel>
                <NativeSelect aria-invalid={invalid} disabled={widget.lock(context)} {id}
                              onchange={onChange} value={value ?? 'notChosen'}>

                    <NativeSelectOption class="hidden" value='notChosen'>{t.widget.notChosen}</NativeSelectOption>
                    {#each options as option}
                        <NativeSelectOption value={option}>{widget.get(t, option)}</NativeSelectOption>
                    {/each}
                    {#if other.length}
                        <NativeSelectOption value='otherOptions'>{t.widget.otherOptions}…</NativeSelectOption>
                    {/if}
                </NativeSelect>
            </Field>
        </FieldGroup>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>