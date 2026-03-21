<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CheckboxWithInputWidget, type ChI, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import { type Snippet } from 'svelte';
    import CoreInput from '$lib/components/CoreInput.svelte';

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

    const uid = $props.id();
</script>

{#snippet leadingContent()}
    <button class="input-group-text input-group-input" onclick={onClick} aria-labelledby="label-{uid}" tabindex="-1">
        <input class="form-check-input m-0" type="checkbox" role="button" disabled={widget.lock(context)} checked={value.checked} onclick={onClick} />
    </button>
{/snippet}

{#snippet coreContent(field: Snippet)}
    {#if !value.checked}
        <input type="text" placeholder={labelAndStar(widget, context, t)} readonly
               onclick={onClick} class="form-control shadow-none input-group-text"
               role="button" disabled={widget.lock(context)} tabindex="-1" />
    {:else}
        {@render field()}
    {/if}
{/snippet}

<CoreInput
    bind:value {widget} {context} setTextValue={text => ({ ...value, text })} {t} textValue={value.text} {uid} bind:showError
    {leadingContent} {coreContent}
/>