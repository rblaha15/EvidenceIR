<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { BaseWidget, Widget } from '$lib/forms/Widget';
    import { dateFromISO, datetimeFromISO } from '$lib/helpers/date';
    import Title from '$lib/components/widgets/Title.svelte';
    import type { WidgetValue } from '$lib/forms/Form';

    interface Props {
        t: Translations;
        widget: Widget<C>;
        context: C;
        value: WidgetValue<Widget<C>>;
    }

    const { t, widget, value, context }: Props = $props();

    const v = <U>(_w: BaseWidget<C, U>, _v: unknown): _v is U => true;
</script>

{#if widget.widgetType === 'title' && widget.showTextValue(context)}
    <Title {widget} {context} {t} />
{:else if widget.widgetType === 'text' && widget.showTextValue(context)}
    {#await widget.text(t, context) then text}
        {#if text}<p class={[widget.class(context), 'm-0']}>{text}</p>{/if}
    {/await}
{:else if widget.widgetType === 'inlinePdfPreview'} <!-- Not supported -->
{:else if widget.widgetType === 'button'} <!-- Not supported -->
{:else if widget.showTextValue(context)}
    <p class="mb-0"><b>{widget.label(t, context)}</b>:
        {#if widget.widgetType === 'scanner' && v(widget, value)}
            {value}
        {:else if widget.widgetType === 'input' && v(widget, value)}
            {!value
                ? ''
                : widget.type(context) === 'date'
                    ? dateFromISO(value)
                    : widget.type(context) === 'datetime-local'
                        ? datetimeFromISO(value)
                        : value}
        {:else if widget.widgetType === 'doubleChooser' && v(widget, value)}
            {widget.get(t, value.first)} {widget.get(t, value.second)}
        {:else if widget.widgetType === 'chooser' && v(widget, value)}
            {widget.get(t, value)}
        {:else if widget.widgetType === 'radio' && v(widget, value)}
            {widget.get(t, value)}
        {:else if widget.widgetType === 'radioWithInput' && v(widget, value)}
            {value.chosen === widget.options(context).at(-1) ? value.text : widget.get(t, value.chosen)}
        {:else if widget.widgetType === 'switch' && v(widget, value)}
            {value ? widget.options(t)[1] : widget.options(t)[0]}
        {:else if widget.widgetType === 'multiCheckbox' && v(widget, value)}
            {(widget.inverseSelection ? widget.options(context).filter(i => !value.includes(i)) : value)
                .map(v => widget.get(t, v)).join(', ')}
        {:else if widget.widgetType === 'checkbox' && v(widget, value)}
            {value ? t.widget.yes : t.widget.no}
        {:else if widget.widgetType === 'counter' && v(widget, value)}
            {value}
        {:else if widget.widgetType === 'checkboxWithChooser' && v(widget, value)}
            {value.checked ? widget.get(t, value.chosen) : t.widget.no}
        {:else if widget.widgetType === 'counters' && v(widget, value)}
            {value.mapTo((k, v) => `${widget.get(t, k)}: ${v}x`).join(', ')}
        {:else if widget.widgetType === 'inputWithChooser' && v(widget, value)}
            {value.text} {widget.get(t, value.chosen)}
        {:else if widget.widgetType === 'checkboxWithInput' && v(widget, value)}
            {value.checked ? value.text : t.widget.no}
        {:else if widget.widgetType === 'search' && v(widget, value)}
            {widget.getXmlEntry(v)}
        {:else if widget.widgetType === 'file' && v(widget, value)} <!-- Not supported -->
        {:else if widget.widgetType === 'photoSelector' && v(widget, value)} <!-- Not supported -->
        {/if}
    </p>
{/if}