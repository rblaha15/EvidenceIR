<script generics="C" lang="ts">
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
        CountersWidget,
        InputWithChooserWidget,
        CheckboxWithInputWidget,
        PhotoSelectorWidget,
        FileWidget, InlinePdfPreviewWidget, RadioWithInputWidget, ButtonWidget,
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
    import Counters from '$lib/components/widgets/Counters.svelte'
    import InputWithChooser from '$lib/components/widgets/InputWithChooser.svelte'
    import CheckboxWithInput from '$lib/components/widgets/CheckboxWithInput.svelte'
    import PhotoSelector from "$lib/components/widgets/PhotoSelector.svelte";
    import File from "$lib/components/widgets/File.svelte";
    import InlinePdfPreview from '$lib/components/widgets/InlinePdfPreview.svelte';
    import Title from '$lib/components/widgets/Title.svelte';
    import RadioWithInput from '$lib/components/widgets/RadioWithInput.svelte';
    import Button from '$lib/components/widgets/Button.svelte';
    import type { WidgetValue } from '$lib/forms/Form.ts';

    interface Props {
        t: Translations;
        widget: Widget<C>;
        context: C;
        value: WidgetValue<Widget<C>>;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();
</script>

{#if widget instanceof TitleWidget && widget.show(context)}
    <Title {widget} {t} {context} />
{:else if widget instanceof TextWidget && widget.show(context)}
    {#await widget.text(t, context) then text}
        {#if text}<p class={[widget.class(context), 'm-0']}>{@html text}</p>{/if}
    {/await}
{:else if widget instanceof InlinePdfPreviewWidget && widget.show(context)}
    <InlinePdfPreview {widget} {t} {context} />
{:else if widget instanceof ButtonWidget && widget.show(context)}
    <Button {widget} {t} {context} />
{:else if widget instanceof ScannerWidget && widget.show(context)}
    <Scanner {widget} {t} bind:value {context} />
{:else if widget instanceof InputWidget && widget.show(context)}
    <Input {widget} {t} bind:value {context} />
{:else if widget instanceof DoubleChooserWidget && widget.show(context)}
    <DoubleChooser {widget} {t} bind:value {context} />
{:else if widget instanceof ChooserWidget && widget.show(context)}
    <Chooser {widget} {t} bind:value {context} />
{:else if widget instanceof RadioWidget && widget.show(context)}
    <Radio {widget} {t} bind:value {context} />
{:else if widget instanceof RadioWithInputWidget && widget.show(context)}
    <RadioWithInput {widget} {t} bind:value {context} />
{:else if widget instanceof SwitchWidget && widget.show(context)}
    <Switch {widget} {t} bind:value {context} />
{:else if widget instanceof MultiCheckboxWidget && widget.show(context)}
    <MultiCheckbox {t} {widget} bind:value {context} />
{:else if widget instanceof CheckboxWidget && widget.show(context)}
    <Checkbox {t} {widget} bind:value {context} />
{:else if widget instanceof CounterWidget && widget.show(context)}
    <Counter {t} {widget} bind:value {context} />
{:else if widget instanceof CheckboxWithChooserWidget && widget.show(context)}
    <CheckboxWithChooser {t} {widget} bind:value {context} />
{:else if widget instanceof CountersWidget && widget.show(context)}
    <Counters {t} {widget} bind:value {context} />
{:else if widget instanceof InputWithChooserWidget && widget.show(context)}
    <InputWithChooser {t} {widget} bind:value {context} />
{:else if widget instanceof CheckboxWithInputWidget && widget.show(context)}
    <CheckboxWithInput {t} {widget} bind:value {context} />
{:else if widget instanceof SearchWidget && widget.show(context)}
    <Search {t} {widget} bind:value {context} />
{:else if widget instanceof FileWidget && widget.show(context)}
    <File {t} {widget} bind:value {context} />
{:else if widget instanceof PhotoSelectorWidget && widget.show(context)}
    <PhotoSelector {t} {widget} bind:value {context} />
{/if}