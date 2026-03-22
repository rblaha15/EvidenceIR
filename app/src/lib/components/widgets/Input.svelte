<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget } from '$lib/forms/Widget';
    import CoreInput from '$lib/components/CoreInput.svelte';

    interface Props {
        t: Translations;
        widget: InputWidget<C>;
        context: C;
        value: string;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);
</script>

<CoreInput
    bind:value {widget} {context} setTextValue={text => text} {t} textValue={value} bind:showError
/>