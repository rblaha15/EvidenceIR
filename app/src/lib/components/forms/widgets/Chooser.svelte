<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type ChooserWidget } from '$lib/forms/Widget';
    import CoreChooser from '$lib/components/forms/CoreChooser.svelte';

    interface Props {
        t: Translations;
        widget: ChooserWidget<C, I>;
        context: C;
        value: I | null;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);
</script>

<CoreChooser
    bind:showError bind:value chosenValue={value} {context} setChosenValue={chosen => chosen} {t} {widget}
/>