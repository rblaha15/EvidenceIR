<script generics="C, U" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type AdvancedInput, type BaseInput, type BaseWidget, labelAndStar, type Lock, type Required, type WidgetType, } from '$lib/forms/Widget';
    import { type ComponentProps, type Snippet } from 'svelte';
    import { readable } from 'svelte/store';
    import { Eraser } from '@lucide/svelte';
    import {
        InputGroup,
        InputGroupAddon,
        InputGroupButton,
        InputGroupInput,
        InputGroupInputMasked,
        InputGroupText,
        InputGroupTextarea
    } from "$lib/components/ui/input-group";
    import { Field, FieldError, FieldGroup, FieldLabel } from "$lib/components/ui/field";

    type GenericInputWidget<C, U> = BaseWidget<C, U> & BaseInput<C> & ({
        textArea?: undefined;
        compact?: undefined;
        autocomplete?: undefined;
        maskOptions?: undefined;
        capitalize?: undefined;
        placeholder?: undefined;
        suffix?: undefined;
        suggestions?: undefined;
    } | AdvancedInput<C>) & Lock<C> & Required<C, U, WidgetType, boolean>;

    interface Props {
        t: Translations;
        widget: GenericInputWidget<C, U>;
        context: C;
        value: U;
        textValue: string;
        setTextValue: (value: string) => U;
        showError: boolean;
        leadingContent?: Snippet;
        coreContent?: Snippet<[Snippet]>;
        trailingContent?: Snippet;
        id?: string;
    }

    const defaultId = $props.id();

    let {
        t, widget, value: widgetValue = $bindable(), context, textValue: value, setTextValue, showError = $bindable(),
        leadingContent, coreContent = defaultCore, trailingContent, id = defaultId,
    }: Props = $props();

    const suggestions = $derived(widget.suggestions?.(t, context) ?? readable([]));

    const maybeCapitalized = (value: string, widget: GenericInputWidget<C, U>): string =>
        widget.capitalize?.(context) ? value.toUpperCase() : value;

    const onInput = (text: string) => {
        const newValue = setTextValue(maybeCapitalized(text, widget));
        widgetValue = newValue;
        widget.onValueSet(context, newValue);
    };

    const options = $derived(widget.maskOptions?.(context));

    const clear = () => {
        onInput('');
        showError = true;
    };

    const invalid = $derived(widget.isError(context, widgetValue) && showError);

    const commonProps = $derived({
        autocomplete: widget.autocomplete?.(context),
        inputmode: widget.inputmode(context),
        enterkeyhint: widget.enterkeyhint(context),
        autocapitalize: widget.autocapitalize(context),
        placeholder: widget.placeholder?.(t, context),
        id: `input-${id}`,
        value,
        onInput,
        onblur: () => showError = true,
        disabled: widget.lock(context),
        'aria-invalid': invalid,
    } satisfies Partial<ComponentProps<typeof InputGroupTextarea & typeof InputGroupInput & typeof InputGroupInputMasked>>);
    const commonInputProps = $derived({
        list: `suggestions-${id}`,
        type: widget.type(context),
    } satisfies Partial<ComponentProps<typeof InputGroupInput & typeof InputGroupInputMasked>>);
</script>

{#snippet defaultCore(field: Snippet)}
    {@render field()}
{/snippet}

{#snippet field()}
    {#if widget.textArea?.(context)}
        <InputGroupTextarea
            class="resize-y min-h-36 grow"
            {...commonProps}
        />
    {:else if options !== undefined}
        <InputGroupInputMasked
            class="grow"
            {options}
            {...commonProps}
            {...commonInputProps}
        />
    {:else}
        <InputGroupInput
            class="grow"
            {...commonProps}
            {...commonInputProps}
        />
    {/if}
    {#if $suggestions.length}
        <datalist id="suggestions-{id}">
            {#each $suggestions as suggestion}
                <option value={suggestion}>{suggestion}</option>
            {/each}
        </datalist>
    {/if}
{/snippet}

<div class="flex flex-col gap-1 w-full">
    <FieldGroup>
        <Field class="w-auto" data-invalid={invalid} orientation="responsive">
            {#if widget.label(t, context)}
                <FieldLabel class="grow-0!" for="input-{id}">{labelAndStar(widget, context, t)}</FieldLabel>
            {/if}
            <InputGroup class="grow">
                {#if leadingContent}
                    <InputGroupAddon align="inline-start">
                        {@render leadingContent()}
                    </InputGroupAddon>
                {/if}
                {@render coreContent(field)}
                {#if widget.suffix?.(t, context) || trailingContent || value && widget.type(context) === 'date' && !widget.required(context)}
                    <InputGroupAddon align="inline-end">
                        {#if widget.suffix?.(t, context)}
                            <InputGroupText class="text-foreground">{widget.suffix(t, context) ?? ''}</InputGroupText>
                        {/if}
                        {#if value && widget.type(context) === 'date' && !widget.required(context)}
                            <InputGroupButton size="icon-sm" onclick={clear}>
                                <Eraser />
                                <span class="sr-only">{t.widget.clearSelection}</span>
                            </InputGroupButton>
                        {/if}
                        {@render trailingContent?.()}
                    </InputGroupAddon>
                {/if}
            </InputGroup>
        </Field>
    </FieldGroup>

    {#if invalid}
        <FieldError>{widget.onError(t, context)}</FieldError>
    {/if}
</div>