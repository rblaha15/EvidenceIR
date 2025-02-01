import type { Data } from '$lib/forms/Data';
import {
    DvojVybiratkova,
    MultiZaskrtavatkova,
    Pisatkova,
    Pocitatkova,
    Prepinatkova,
    Radiova,
    SearchWidget,
    type Vec,
    Vybiratkova,
    Zaskrtavatkova
} from '$lib/Vec.svelte';
import type { Translations } from '$lib/translations';
import type { Form } from '$lib/forms/Form';

const camelToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const widgetToXML = (v: Vec<Data, unknown>, t: Translations) => {
    if (v instanceof Pisatkova)
        return v.value;
    if (v instanceof DvojVybiratkova)
        return `${t.get(v.value.first) ?? ''} ${t.get(v.value.second) ?? ''}`;
    if (v instanceof Vybiratkova)
        return t.get(v.value) ?? '';
    if (v instanceof Radiova)
        return t.get(v.value) ?? '';
    if (v instanceof Prepinatkova)
        return t.get(v.value ? v.moznosti[1] : v.moznosti[0]);
    if (v instanceof MultiZaskrtavatkova)
        return v.value.map(s => t.get(s)).join(', ');
    if (v instanceof Zaskrtavatkova)
        return v.value ? t.yes : t.no;
    if (v instanceof Pocitatkova)
        return v.value.toLocaleString('cs');
    if (v instanceof SearchWidget)
        return v.getXmlEntry();
    return '';
};
export const generateXML = (data: Data, t: Translations) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="SEIR.xsl"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 1.1
-->

<evidence>
${Object.entries(data as Form<Data>).map(([k1, section]) =>
    `    <${camelToSnakeCase(k1)}>
${Object.entries(section).filter(([, v]) =>
        v.showText(data) && v.value != undefined
    ).map(([k2, v]) =>
        `        <${camelToSnakeCase(k2)}>${
            widgetToXML(v, t)
        }</${camelToSnakeCase(k2)}>`
    ).join('\n')}
    </${camelToSnakeCase(k1)}>`
).join('\n')}
</evidence>
`.trim();
