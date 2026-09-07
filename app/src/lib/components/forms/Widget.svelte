<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Widget, type WidgetType } from '$lib/forms/Widget';
    import Input from '$lib/components/forms/widgets/Input.svelte';
    import DoubleChooser from '$lib/components/forms/widgets/DoubleChooser.svelte';
    import Chooser from '$lib/components/forms/widgets/Chooser.svelte';
    import Radio from '$lib/components/forms/widgets/Radio.svelte';
    import Switch from '$lib/components/forms/widgets/Switch.svelte';
    import MultiCheckbox from '$lib/components/forms/widgets/MultiCheckbox.svelte';
    import Checkbox from '$lib/components/forms/widgets/Checkbox.svelte';
    import Counter from '$lib/components/forms/widgets/Counter.svelte';
    import Search from '$lib/components/forms/widgets/Search.svelte';
    import Scanner from '$lib/components/forms/widgets/Scanner.svelte';
    import CheckboxWithChooser from '$lib/components/forms/widgets/CheckboxWithChooser.svelte'
    import Counters from '$lib/components/forms/widgets/Counters.svelte'
    import InputWithChooser from '$lib/components/forms/widgets/InputWithChooser.svelte'
    import CheckboxWithInput from '$lib/components/forms/widgets/CheckboxWithInput.svelte'
    import PhotoSelector from "$lib/components/forms/widgets/PhotoSelector.svelte";
    import File from "$lib/components/forms/widgets/File.svelte";
    import InlinePdfPreview from '$lib/components/forms/widgets/InlinePdfPreview.svelte';
    import Title from '$lib/components/forms/widgets/Title.svelte';
    import RadioWithInput from '$lib/components/forms/widgets/RadioWithInput.svelte';
    import Button from '$lib/components/forms/widgets/Button.svelte';
    import type { WidgetValue } from '$lib/forms/Form.ts';

    interface Props {
        t: Translations;
        widget: Widget<C, WidgetType, any>;
        context: C;
        value: WidgetValue<Widget<C>>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
</script>

{#if widget.widgetType === 'title' && widget.show(context)}
    <Title {widget} {t} {context} />
{:else if widget.widgetType === 'text' && widget.show(context)}
    {#await widget.text(t, context) then text}
        {#if text}<p class={[widget.class(context), 'm-0']}>{@html text}</p>{/if}
    {/await}
{:else if widget.widgetType === 'inlinePdfPreview' && widget.show(context)}
    <InlinePdfPreview {widget} {t} {context} />
{:else if widget.widgetType === 'button' && widget.show(context)}
    <Button {widget} {t} {context} />
{:else if widget.widgetType === 'scanner' && widget.show(context)}
    <Scanner {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'input' && widget.show(context)}
    <Input {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'doubleChooser' && widget.show(context)}
    <DoubleChooser {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'chooser' && widget.show(context)}
    <Chooser {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'radio' && widget.show(context)}
    <Radio {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'radioWithInput' && widget.show(context)}
    <RadioWithInput {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'switch' && widget.show(context)}
    <Switch {widget} {t} bind:value {showAllErrors} {context} />
{:else if widget.widgetType === 'multiCheckbox' && widget.show(context)}
    <MultiCheckbox {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'checkbox' && widget.show(context)}
    <Checkbox {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'counter' && widget.show(context)}
    <Counter {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'checkboxWithChooser' && widget.show(context)}
    <CheckboxWithChooser {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'counters' && widget.show(context)}
    <Counters {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'inputWithChooser' && widget.show(context)}
    <InputWithChooser {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'checkboxWithInput' && widget.show(context)}
    <CheckboxWithInput {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'search' && widget.show(context)}
    <Search {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'file' && widget.show(context)}
    <File {t} {widget} bind:value {context} {showAllErrors} />
{:else if widget.widgetType === 'photoSelector' && widget.show(context)}
    <PhotoSelector {t} {widget} bind:value {context} {showAllErrors} />
{/if}