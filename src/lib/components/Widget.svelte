<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import {
        DoubleChooserWidget,
        MultiCheckboxWidget,
        TitleWidget,
        InputWidget, CounterWidget,
        SwitchWidget,
        RadioWidget, SearchWidget,
        TextWidget,
        type Widget,
        ChooserWidget,
        CheckboxWidget,
        ScannerWidget,
        CheckboxWithChooserWidget,
        InputWithSuggestionsWidget,
        CountersWidget,
        InputWithChooserWidget,
        CheckboxWithInputWidget,
        PhotoSelectorWidget,
        FileWidget, InlinePdfPreviewWidget,
    } from '$lib/forms/Widget.svelte.js';
    import Input from '$lib/components/widgets/Input.svelte';
    import DoubleChooser from '$lib/components/widgets/DoubleChooser.svelte';
    import Chooser from '$lib/components/widgets/Chooser.svelte';
    import Radio from '$lib/components/widgets/Radio.svelte';
    import Switch from '$lib/components/widgets/Switch.svelte';
    import MultiCheckbox from '$lib/components/widgets/MultiCheckbox.svelte';
    import Checkbox from '$lib/components/widgets/Checkbox.svelte';
    import Counter from '$lib/components/widgets/Counter.svelte';
    import Search from '$lib/components/widgets/Search.svelte';
    import Scanner from '$lib/components/widgets/Scanner.svelte';
    import CheckboxWithChooser from '$lib/components/widgets/CheckboxWithChooser.svelte'
    import InputWithSuggestions from '$lib/components/widgets/InputWithSuggestions.svelte'
    import Counters from '$lib/components/widgets/Counters.svelte'
    import InputWithChooser from '$lib/components/widgets/InputWithChooser.svelte'
    import CheckboxWithInput from '$lib/components/widgets/CheckboxWithInput.svelte'
    import PhotoSelector from "$lib/components/widgets/PhotoSelector.svelte";
    import File from "$lib/components/widgets/File.svelte";
    import InlinePdfPreview from '$lib/components/widgets/InlinePdfPreview.svelte';
    import Title from '$lib/components/widgets/Title.svelte';

    interface Props {
        t: Translations;
        widget: Widget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();
</script>

{#if widget instanceof TitleWidget && widget.show(data)}
    <Title {widget} {t} {data} />
{:else if widget instanceof TextWidget && widget.show(data)}
    {#await widget.text(t, data) then text}
        {#if text}<p class={[widget.class(data), 'm-0']}>{text}</p>{/if}
    {/await}
{:else if widget instanceof InlinePdfPreviewWidget && widget.show(data)}
    <InlinePdfPreview {widget} {t} {data} />
{:else if widget instanceof ScannerWidget && widget.show(data)}
    <Scanner bind:widget {t} {data} />
{:else if widget instanceof InputWidget && widget.show(data)}
    <Input bind:widget {t} {data} />
{:else if widget instanceof DoubleChooserWidget && widget.show(data)}
    <DoubleChooser bind:widget {t} {data} />
{:else if widget instanceof ChooserWidget && widget.show(data)}
    <Chooser bind:widget {t} {data} />
{:else if widget instanceof RadioWidget && widget.show(data)}
    <Radio bind:widget {t} {data} />
{:else if widget instanceof SwitchWidget && widget.show(data)}
    <Switch bind:widget {t} {data} />
{:else if widget instanceof MultiCheckboxWidget && widget.show(data)}
    <MultiCheckbox {t} bind:widget {data} />
{:else if widget instanceof CheckboxWidget && widget.show(data)}
    <Checkbox {t} bind:widget {data} />
{:else if widget instanceof CounterWidget && widget.show(data)}
    <Counter {t} bind:widget {data} />
{:else if widget instanceof CheckboxWithChooserWidget && widget.show(data)}
    <CheckboxWithChooser {t} bind:widget={widget} {data} />
{:else if widget instanceof InputWithSuggestionsWidget && widget.show(data)}
    <InputWithSuggestions {t} bind:widget={widget} {data} />
{:else if widget instanceof CountersWidget && widget.show(data)}
    <Counters {t} bind:widget={widget} {data} />
{:else if widget instanceof InputWithChooserWidget && widget.show(data)}
    <InputWithChooser {t} bind:widget={widget} {data} />
{:else if widget instanceof CheckboxWithInputWidget && widget.show(data)}
    <CheckboxWithInput {t} bind:widget={widget} {data} />
{:else if widget instanceof SearchWidget && widget.show(data)}
    <Search {t} bind:widget={widget} {data} />
{:else if widget instanceof FileWidget && widget.show(data)}
    <File {t} bind:widget={widget} {data} />
{:else if widget instanceof PhotoSelectorWidget && widget.show(data)}
    <PhotoSelector {t} bind:widget={widget} {data} />
{/if}