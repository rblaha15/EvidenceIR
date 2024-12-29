import type { Data, GeneralData } from '$lib/Data';
import { DvojVybiratkova, MultiZaskrtavatkova, Pisatkova, Prepinatkova, Radiova, type Vec, Vybiratkova, Zaskrtavatkova } from '$lib/Vec.svelte';
import type { Translations } from '$lib/translations';

const camelToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const widgetToXML = (v: Vec<Data, any>, t: Translations) => {
    if (v instanceof Pisatkova)
        return v.value
    if (v instanceof DvojVybiratkova)
        return `${t.get(v.value.first) ?? ''} ${t.get(v.value.second) ?? ''}`
    if (v instanceof Vybiratkova)
        return t.get(v.value) ?? ''
    if (v instanceof Radiova)
        return t.get(v.value) ?? ''
    if (v instanceof Prepinatkova)
        return t.get(v.value ? v.moznosti[1] : v.moznosti[0])
    if (v instanceof MultiZaskrtavatkova)
        return v.value.map(s => t.get(s)).join(', ')
    if (v instanceof Zaskrtavatkova)
        return v.value ? t.yes : t.no
    return ''
};
export const generateXML = (data: Data, t: Translations) => `
<?xml version="1.0" encoding="utf-8"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 1.0
-->

<evidence>
${Object.entries(data as GeneralData).map(([k1, section]) =>
    `    <${camelToSnakeCase(k1)}>
${Object.entries(section).filter(([_, v]) =>
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
