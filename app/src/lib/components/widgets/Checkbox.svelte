<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type CheckboxWidget, labelAndStar } from '$lib/forms/Widget';
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Field, FieldContent, FieldError, FieldLabel, FieldTitle } from "$lib/components/ui/field";

    interface Props {
        t: Translations;
        widget: CheckboxWidget<C>;
        context: C;
        value: boolean;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onCheckedChange = (checked: boolean) => {
        if (!widget.lock(context)) {
            value = checked;
            widget.onValueSet(context, checked);
            showError = true;
        }
    };

    const id = $props.id();
    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<FieldLabel for={id}>
    <Field data-invalid={invalid} orientation="horizontal">
        <Checkbox aria-invalid={invalid} checked={value} disabled={widget.lock(context)} {id} {onCheckedChange} />
        <FieldContent>
            {#if widget.label(t, context)}
                <FieldTitle>{labelAndStar(widget, context, t)}</FieldTitle>
            {/if}
            {#if widget.descriptionItems(t, context).length}
                <ul class="text-muted-foreground list-disc">
                    {#each widget.descriptionItems(t, context) as item}
                        <li>{item}</li>
                    {/each}
                </ul>
            {/if}
            {#if invalid}
                <FieldError>{widget.onError(t, context)}</FieldError>
            {/if}
        </FieldContent>
    </Field>
</FieldLabel>

<!--<Card class="py-4">
    <CardContent class="px-4">
        <Field orientation="horizontal" data-slot="input-group-control">
            <Checkbox id="finder-pref-9k4-sync-folders-nep" checked />
            <FieldContent>
                <FieldLabel for="finder-pref-9k4-sync-folders-nep">
                    Sync Desktop & Documents folders
                </FieldLabel>
                <FieldDescription>
                    Your Desktop & Documents folders are being synced with iCloud Drive
                    You can access them from other devices
                </FieldDescription>
            </FieldContent>
        </Field>
    </CardContent>
</Card>

<InputGroup class="">
    <Checkbox data-slot="input-group-control" class="mx-2" {id} />
    <Label for={id}>AAAA</Label>
</InputGroup>

<InputGroup class="">
    <Field orientation="horizontal" data-slot="input-group-control">
        <Checkbox id="finder-pref-9k2-sync-folders-nep" checked />
        <FieldContent>
            <FieldLabel for="finder-pref-9k2-sync-folders-nep">
                Sync Desktop & Documents folders
            </FieldLabel>
            <FieldDescription>
                Your Desktop & Documents folders are being synced with iCloud Drive
                You can access them from other devices
            </FieldDescription>
        </FieldContent>
    </Field>
</InputGroup>-->