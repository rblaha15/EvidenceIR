<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type RadioWidget } from '$lib/forms/Widget';
    import CoreRadio from "$lib/components/CoreRadio.svelte";

    interface Props {
        t: Translations;
        widget: RadioWidget<C, I>;
        context: C;
        value: I | null;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);
</script>

<CoreRadio
    bind:showError bind:value chosenValue={value} {context} setChosenValue={chosen => chosen} {t} {widget}
/>