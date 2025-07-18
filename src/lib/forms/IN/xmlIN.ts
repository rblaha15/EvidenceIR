import type { FormIN } from '$lib/forms/IN/formIN';
import {
    DoubleChooserWidget,
    MultiCheckboxWidget,
    InputWidget,
    CounterWidget,
    SwitchWidget,
    RadioWidget,
    SearchWidget,
    type Widget,
    ChooserWidget,
    CheckboxWidget
} from '$lib/forms/Widget.svelte.js';
import type { Translations } from '$lib/translations';
import type { Form } from '$lib/forms/Form';

const camelToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const widgetToXML = (v: Widget<FormIN>, t: Translations) => {
    if (v instanceof InputWidget)
        return v.value;
    if (v instanceof DoubleChooserWidget)
        return `${t.get(v.value.first) ?? ''} ${t.get(v.value.second) ?? ''}`;
    if (v instanceof ChooserWidget)
        return t.get(v.value) ?? '';
    if (v instanceof RadioWidget)
        return t.get(v.value) ?? '';
    if (v instanceof SwitchWidget)
        return t.get(v.value ? v.options[1] : v.options[0]);
    if (v instanceof MultiCheckboxWidget)
        return v.value.map(s => t.get(s)).join(', ');
    if (v instanceof CheckboxWidget)
        return v.value ? t.yes : t.no;
    if (v instanceof CounterWidget)
        return v.value.toLocaleString('cs');
    if (v instanceof SearchWidget)
        return v.getXmlEntry();
    return '';
};
export const xmlIN = (data: FormIN, t: Translations) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="SEIR.xsl"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 1.2
-->

<evidence>
${(data as Form<FormIN>).mapTo((k1, section) =>
    `    <${camelToSnakeCase(k1)}>
${section.entries().filter(([, v]) =>
    v.showTextValue(data) && v.value != undefined
).map(([k2, v]) =>
    `        <${camelToSnakeCase(k2)}>${widgetToXML(v, t)}</${camelToSnakeCase(k2)}>`
).join('\n')}
    </${camelToSnakeCase(k1)}>`
).join('\n')}
</evidence>
`.trim();
