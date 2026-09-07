<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { type CheckboxWithChooserWidget, labelAndStar, type SeCh } from '$lib/forms/Widget';
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { NativeSelect, NativeSelectOption } from "$lib/components/ui/native-select";
    import type { Attachment } from "svelte/attachments";
    import type { ChangeEventHandler } from "svelte/elements";

    interface Props {
        t: Translations;
        widget: CheckboxWithChooserWidget<C, I>;
        context: C;
        value: SeCh<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onChange: ChangeEventHandler<HTMLSelectElement> = e => {
        const newValue = { checked: true, chosen: e.currentTarget.value as I };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };

    let mounted = false;
    onMount(() => mounted = true);
    const select: Attachment<HTMLSelectElement> = target => {
        if (mounted && !target.disabled) {
            showError = false;
            target.showPicker();
        }
    };

    const onClick = () => {
        const newValue = { ...value, checked: !value.checked };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };

    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

<Card class="w-full" size="sm">
    <CardContent>
        <FieldGroup>
            <Field data-invalid={invalid} orientation="horizontal">
                <Checkbox aria-invalid={invalid} checked={value.checked} id={id} onCheckedChange={onClick} />

                <FieldLabel for={id}>{labelAndStar(widget, context, t)}</FieldLabel>

                {#if value.checked}
                    <NativeSelect aria-invalid={invalid} onchange={onChange} value={value.chosen} {@attach select}>
                        {#each widget.options(context) as option}
                            <NativeSelectOption value={option}>{widget.get(t, option)}</NativeSelectOption>
                        {/each}
                    </NativeSelect>
                {/if}
            </Field>
        </FieldGroup>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>