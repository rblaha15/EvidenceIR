<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWidget } from '$lib/forms/Widget.svelte.js';
    import CoreInput from '$lib/components/CoreInput.svelte';

    interface Props {
        t: Translations;
        widget: InputWidget<C>;
        context: C;
        value: string;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();
</script>

<CoreInput
    bind:value {widget} {context} setTextValue={text => text} {t} textValue={value}
/>