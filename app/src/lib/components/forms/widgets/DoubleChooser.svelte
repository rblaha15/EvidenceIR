<script generics="C, I1 extends string, I2 extends string" lang="ts">
    import { onMount, untrack } from 'svelte';
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { type Arr, type DoubleChooserWidget, labelAndStar, type Pair } from '$lib/forms/Widget';
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";
    import { NativeSelect } from "$lib/components/ui/native-select";
    import { Card, CardContent } from "$lib/components/ui/card";
    import type { Attachment } from "svelte/attachments";

    interface Props {
        t: Translations;
        widget: DoubleChooserWidget<C, I1, I2>;
        context: C;
        value: Pair<I1, I2>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let other1 = $state([] as Arr<I1>);
    let options1 = $state([] as Arr<I1>);
    const onChange1: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options1 = [...options1, ...other1];
            other1 = [];
            setTimeout(() => target.showPicker())
        } else {
            const newValue = { ...value, first: option as I1 };
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        }
    };
    $effect(() => {
        options1 = widget.options1(context);
        other1 = widget.otherOptions1(context);
        untrack(() => {
            if (value.first && other1.includes(value.first)) {
                options1 = [...options1, ...other1];
                other1 = [];
            }
        })
    });

    let other2 = $state([] as Arr<I2>);
    let options2 = $state([] as Arr<I2>);
    const onChange2: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options2 = [...options2, ...other2];
            other2 = [];
            setTimeout(() => target.showPicker())
        } else {
            const newValue = { ...value, second: option as I2 };
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        }
    };
    $effect(() => {
        options2 = widget.options2(context);
        other2 = widget.otherOptions2(context);
        untrack(() => {
            if (value.second && other2.includes(value.second)) {
                options2 = [...options2, ...other2];
                other2 = [];
            }
        })
    });

    let mounted = false;
    onMount(() => mounted = true);
    const select: Attachment<HTMLSelectElement> = target => {
        if (mounted && !target.disabled) {
            showError = false;
            target.showPicker();
        }
    };

    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

{#snippet showGroups(other: (Arr<I1> | Arr<I2>), options: (Arr<I1> | Arr<I2>))}
    <option class="hidden" value='notChosen'>{t.widget.notChosen}</option>
    {#each options as option}
        <option value={option}>{widget.get(t, option)}</option>
    {/each}
    {#if other.length}
        <option value='otherOptions'>{t.widget.otherOptions}…</option>
    {/if}
{/snippet}

<Card class="w-full" size="sm">
    <CardContent>
        <FieldGroup>
            <Field data-invalid={invalid} orientation={'responsive'}>
                <FieldLabel for="{id}-1">{labelAndStar(widget, context, t)}</FieldLabel>
                <NativeSelect aria-invalid={invalid} disabled={widget.lock1(context)} id="{id}-1"
                              onchange={onChange1} value={value.first ?? 'notChosen'}>
                    {@render showGroups(other1, options1)}
                </NativeSelect>
                {#if value.first != null && widget.options2(context).length > 0}
                    <NativeSelect aria-invalid={invalid} disabled={widget.options2(context).length < 2 || widget.lock2(context)}
                                  id="{id}-2" {@attach select} onchange={onChange2} value={value.second ?? 'notChosen'}>
                        {@render showGroups(other2, options2)}
                    </NativeSelect>
                {/if}
            </Field>
        </FieldGroup>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>