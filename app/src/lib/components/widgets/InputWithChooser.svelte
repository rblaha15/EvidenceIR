<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWithChooserWidget, type SeI } from '$lib/forms/Widget';
    import CoreInput from '$lib/components/CoreInput.svelte';
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { ChevronDownIcon } from "@lucide/svelte";
    import { InputGroupButton } from "$lib/components/ui/input-group";

    interface Props {
        t: Translations;
        widget: InputWithChooserWidget<C, I>;
        context: C;
        value: SeI<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onChange = (newOption: string) => {
        const newValue = { ...value, chosen: newOption as I };
        value = newValue;
        widget.onValueSet(context, newValue);
    };
</script>

{#snippet trailingContent()}
    <Select type="single" value={value.chosen} onValueChange={onChange}>
        <SelectTrigger>
            {#snippet child({ props })}
                <InputGroupButton {...props} class="text-foreground">
                    {widget.get(t, value.chosen)}
                    <ChevronDownIcon class="text-muted-foreground size-4 pointer-events-none" />
                </InputGroupButton>
            {/snippet}
        </SelectTrigger>
        <SelectContent>
            {#each widget.options as option}
                <SelectItem value={option}>{widget.get(t, option)}</SelectItem>
            {/each}
        </SelectContent>
    </Select>
{/snippet}

<CoreInput
    bind:showError bind:value {context} setTextValue={text => ({ ...value, text })} {t} textValue={value.text} {trailingContent}
    {widget}
/>