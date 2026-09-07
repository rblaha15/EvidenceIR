<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type CheckboxWithInputWidget, type ChI, labelAndStar } from '$lib/forms/Widget';
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import type { FormEventHandler } from "svelte/elements";

    interface Props {
        t: Translations;
        widget: CheckboxWithInputWidget<C>;
        context: C;
        value: ChI;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onClick = () => {
        const newValue = { ...value, checked: !value.checked };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const oninput: FormEventHandler<HTMLInputElement> = e => {
        const newValue = { ...value, text: e.currentTarget.value ?? value.text };
        value = newValue;
        widget.onValueSet(context, newValue);
    }

    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

<Card class="w-full" size="sm">
    <CardContent>
        <FieldGroup>
            <Field data-invalid={invalid} orientation="horizontal">
                <Checkbox aria-invalid={invalid} checked={value.checked} disabled={widget.lock(context)}
                          id={id} onCheckedChange={onClick} />

                <FieldLabel for={id}>{labelAndStar(widget, context, t)}</FieldLabel>
            </Field>
            {#if value.checked}
                <Field class="w-auto" data-invalid={invalid} orientation="responsive">
                    <FieldLabel class="grow-0!" for="input-{id}">{widget.otherLabel(t, context)}</FieldLabel>
                    <Input
                        aria-invalid={invalid}
                        autocapitalize={widget.autocapitalize(context)}
                        class="grow"
                        disabled={widget.lock(context)}
                        enterkeyhint={widget.enterkeyhint(context)}
                        id="input-{id}"
                        inputmode={widget.inputmode(context)}
                        {oninput}
                        onblur={() => showError = true}
                        type={widget.type(context)}
                        value={value.text}
                    />
                </Field>
            {/if}
        </FieldGroup>
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>