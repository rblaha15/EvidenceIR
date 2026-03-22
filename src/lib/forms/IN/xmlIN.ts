// noinspection SuspiciousTypeOfGuard

import type { ContextIN } from '$lib/forms/IN/formIN';
import type { BaseWidget, Widget } from '$lib/forms/Widget';
import type { Translations } from '$lib/translations';
import type { Form, WidgetValue } from '$lib/forms/Form';
import { browser, dev, version } from '$app/environment';
import { extractIRIDFromParts } from '$lib/helpers/ir';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { page } from '$app/state';

const camelToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const vw = <U>(_w: BaseWidget<ContextIN, U>, _v: unknown): _v is U => true;

const widgetToXML = (w: Widget<ContextIN>, v: WidgetValue<Widget<ContextIN>>, t: Translations) => {
    if (w.widgetType === 'input' && vw(w, v))
        return v;
    if (w.widgetType === 'doubleChooser' && vw(w, v))
        return `${w.get(t, v.first) ?? ''} ${w.get(t, v.second) ?? ''}`;
    if (w.widgetType === 'chooser' && vw(w, v))
        return w.get(t, v) ?? '';
    if (w.widgetType === 'radio' && vw(w, v))
        return w.get(t, v) ?? '';
    if (w.widgetType === 'switch' && vw(w, v))
        return v ? w.options(t)[1] : w.options(t)[0];
    if (w.widgetType === 'multiCheckbox' && vw(w, v))
        return v.map(s => w.get(t, s)).join(', ');
    if (w.widgetType === 'checkbox' && vw(w, v))
        return v ? t.tc.yes : t.tc.no;
    if (w.widgetType === 'counter' && vw(w, v))
        return v.toLocaleString('cs');
    if (w.widgetType === 'search' && vw(w, v))
        return w.getXmlEntry(v);
    return '';
};

const innerXML = (c: ContextIN, t: Translations) => (c.f as Form<ContextIN>).mapTo((k1, section) =>
    `    <${camelToSnakeCase(k1)}>
${section.entries().filter(([k2, w]) =>
        !k2.startsWith('_') && w.showTextValue(c) && c.v[k1][k2] != undefined,
    ).map(([k2, w]) =>
        `        <${camelToSnakeCase(k2)}>${widgetToXML(w, c.v[k1][k2], t)}</${camelToSnakeCase(k2)}>`,
    ).join('\n')}
    </${camelToSnakeCase(k1)}>`,
).join('\n');

export const xmlIN = (c: ContextIN, t: Translations) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="SEIR.xsl"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 1.3
Verze aplikace: ${appVersion} (${version}) (${dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})
-->

<evidence>
${innerXML(c, t).let(xml => {
    const irid = extractIRIDFromParts(c.v.ir.typ.first!, c.v.ir.cislo);
    const link = page.url.origin + detailIrUrl(irid, '?');
    const linkLine = `\n        <odkaz>${link}</odkaz>`;
    const lastNewLine = xml.lastIndexOf('\n')
    return xml.slice(0, lastNewLine) + linkLine + xml.slice(lastNewLine)
})}
</evidence>
`.trim();
