import type { FormIN } from '$lib/forms/IN/formIN';
import {
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    SwitchWidget,
    type Widget,
} from '$lib/forms/Widget.svelte.js';
import type { Translations } from '$lib/translations';
import type { Form } from '$lib/forms/Form';
import { browser, dev, version } from '$app/environment';
import { extractIRIDFromParts } from '$lib/helpers/ir';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { page } from '$app/state';

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

const innerXML = (data: FormIN, t: Translations) => (data as Form<FormIN>).mapTo((k1, section) =>
    `    <${camelToSnakeCase(k1)}>
${section.entries().filter(([, v]) =>
        v.showTextValue(data) && v.value != undefined,
    ).map(([k2, v]) =>
        `        <${camelToSnakeCase(k2)}>${widgetToXML(v, t)}</${camelToSnakeCase(k2)}>`,
    ).join('\n')}
    </${camelToSnakeCase(k1)}>`,
).join('\n');

export const xmlIN = (data: FormIN, t: Translations) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="SEIR.xsl"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 1.3
Verze aplikace: ${appVersion} (${version}) (${dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})
-->

<evidence>
${innerXML(data, t).let(xml => {
    const irid = extractIRIDFromParts(data.ir.typ.value.first!, data.ir.cislo.value);
    const link = page.url.origin + detailIrUrl(irid);
    const linkLine = `\n        <odkaz>${link}</odkaz>`;
    const lastNewLine = xml.lastIndexOf('\n')
    return xml.slice(0, lastNewLine) + linkLine + xml.slice(lastNewLine)
})}
</evidence>
`.trim();
