<script lang="ts">
    import type { STemplate, Template } from '$lib/helpers/templates.js';
    import { getTranslations, type Translate } from '$lib/translations';
    import cs from '$lib/translations/cs';
    import isString from 'lodash.isstring';
    import languageCodes, { type LanguageCode } from '$lib/languageCodes';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';

    type FunctionTranslation = (...args: unknown[]) => string;

    type TemplateTranslation1 = STemplate<(string | number)[]>;
    type TranslationItem1 = string | TemplateTranslation1 | FunctionTranslation
    type TranslationEntry1 = TranslationItem1 | Record<string, unknown>;
    type Translations1 = Record<string, TranslationEntry1>;
    type TemplateTranslation2 = Template<(string | number)[]>;
    type TranslationItem2 = string | TemplateTranslation2 | FunctionTranslation
    type TranslationEntry2 = TranslationItem2 | Record<string, unknown>;
    type Translations2 = Record<string, TranslationEntry2>;

    type JointItem = {
        key: string,
        t: Translate<{
            type: 'template',
            value: Template<(number | string)[]>,
        } | {
            type: 'function',
            value: FunctionTranslation,
        } | {
            type: 'string',
            value: string,
        }>,
    };

    type JointTranslations = ({
        type: 'subsection',
        key: string,
        items: JointTranslations,
    } | {
        type: 'translations';
        items: JointItem[]
    })[]

    const getJointItem = (v: TranslationItem1, t: Translate<TranslationItem2>): JointItem['t'] => {
        if (isString(v)) return (t as Translate<string>)
            .mapValues((_, value) => ({ type: 'string' as const, value }));
        if (Array.isArray(v)) return (t as Translate<TemplateTranslation2>)
            .mapValues((_, value) => ({ type: 'template' as const, value }));
        if (v instanceof Function) return (t as Translate<FunctionTranslation>)
            .mapValues((_, value) => ({ type: 'function' as const, value }));
        throw '?';
    };

    const getJointTranslations = (r: Translations1 = cs, t: Translate<Translations2> = languageCodes.associateWith(getTranslations)) => {
        const result: JointTranslations = [];
        const subsection: JointItem[] = [];
        r.forEachEntry((key, v) => {
            const tr = t.mapValues((_, v) => v[key]);
            if (isString(v) || Array.isArray(v) || v instanceof Function) {
                subsection.push({ key, t: getJointItem(v, tr as Translate<TranslationItem2>) });
            } else {
                if (subsection.length) {
                    result.push({ type: 'translations', items: [...subsection] });
                    subsection.length = 0;
                }
                result.push({ type: 'subsection', key, items: getJointTranslations(v as Translations1, tr as Translate<Translations2>) })
            }
        });
        if (subsection.length)
            result.push({ type: 'translations', items: [...subsection] });
        return result;
    };

    export const jointTranslations = getJointTranslations();

    const parseSelf = <T extends (number | string)[]>(template: Template<T>) => template(
        template.keys.associateWith<T[number], string>(it => `{${it}}`),
    );
    const view = (t: JointItem['t'][LanguageCode]) =>
        t.type == 'template' ? parseSelf(t.value) : t.type == 'function' ? t.value : t.value;
</script>

{#snippet group(key: String, gs: JointTranslations)}
    {#if key}
        <details class="w-full">
            <summary class="text-xl w-full cursor-pointer">{key}</summary>
            <div class="ms-2 border">
                {@render items(key, gs)}
            </div>
        </details>
    {:else}
        {@render items(key, gs)}
    {/if}
{/snippet}

{#snippet items(key: String, gs: JointTranslations)}
    {#each gs as v}
        {#if v.type === 'translations'}
            <Table class="w-full">
                <TableBody class="w-full">
                    {#each v.items as i}
                        <TableRow class="w-full">
                            <TableHead class="w-1/5">{i.key}</TableHead>
                            {#each i.t.entries() as [lang, t]}
                                <TableCell class={['w-1/5', {
                                    'text-danger': lang !== 'cs' && lang !== 'sk' && view(i.t.cs) === view(t),
                                    'text-warning': lang !== 'en' && lang !== 'cs' && view(i.t.en) === view(t) || lang === 'sk' && view(i.t.cs) === view(t),
                                }]}>
                                    {view(t)}
                                </TableCell>
                            {/each}
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            {@render group(key ? key + '.' + v.key : v.key, v.items)}
        {/if}
    {/each}
{/snippet}

<div class="overflow-x-auto">
    <div class="w-[min(400vw,2000px)] [word-wrap:break-word] border">
        <Table class="w-full sticky top-0">
            <TableHeader>
                <TableRow>
                    <TableHead class="w-1/5">ID</TableHead>
                    {#each languageCodes as lang}
                        <TableHead class="w-1/5">{lang.toUpperCase()}</TableHead>
                    {/each}
                </TableRow>
            </TableHeader>
        </Table>
        {@render group('', jointTranslations)}
    </div>
</div>
