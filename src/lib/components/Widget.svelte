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
        ChooserWidget, CheckboxWidget, ScannerWidget,
    } from '$lib/Widget.svelte.js';
    import Input from '$lib/components/widgets/Input.svelte';
    import DoubleChooser from '$lib/components/widgets/DoubleChooser.svelte';
    import Chooser from '$lib/components/widgets/Chooser.svelte';
    import Radio from '$lib/components/widgets/Radio.svelte';
    import Switch from '$lib/components/widgets/Switch.svelte';
    import MultiCheckbox from '$lib/components/widgets/MultiCheckbox.svelte';
    import Checkbox from '$lib/components/widgets/Checkbox.svelte';
    import Counter from '$lib/components/widgets/Counter.svelte';
    import Search from './widgets/Search.svelte';
    import Scanner from '$lib/components/widgets/Scanner.svelte';

    interface Props {
        t: Translations;
        widget: Widget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();
</script>

{#if widget instanceof TitleWidget && widget.show(data)}
    {#await widget.text(data, t) then text}<h2>{t.get(text)}</h2>{/await}
{:else if widget instanceof TextWidget && widget.show(data)}
    {#await widget.text(data, t) then text}<p>{t.get(text)}</p>{/await}
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
{:else if widget instanceof SearchWidget && widget.show(data)}
    <Search {t} bind:widget={widget} {data} />
{/if}