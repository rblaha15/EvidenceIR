<script lang="ts" module>
    import type { STemplate, Template } from '$lib/helpers/templates.js';

    type TranslationEntry = string | STemplate<(string | number)[]> | Record<string, unknown>
    type Translations = Record<string, TranslationEntry>
    type String = string
</script>

<script lang="ts">
    import { type LanguageCode, languageCodes } from '$lib/languages';
    import { getTranslations, type TranslationReference } from '$lib/translations';
    import isString from 'lodash.isstring';
    import cs from '$lib/translations/cs';

    const parseSelf = <T extends (number | string)[]>(template: Template<T>) => template(
        template.keys.associateWith<T[number], string>(it => `{${it}}`),
    );
    const view = (t: Template<(string | number)[]> | string) => typeof t === 'string' ? t : parseSelf(t);
    const get = (lang: LanguageCode, key: string, k: string) => view(getTranslations(lang).get((key ? key + '.' + k : k) as TranslationReference))
    const cast = (v: unknown) => v as Translations
</script>

{#snippet group(key: String, g: Translations)}
    {#if key}
        <h3 class="p-3">{key}</h3>
    {/if}
    {#each g.entries() as [k, v]}
        {#if isString(v) || Array.isArray(v)}
            {@const cs = get('cs', key, k)}
            {@const en = get('en', key, k)}
            <tr>
                <th>{k}</th>
                {#each languageCodes as lang}
                    {@const v = get(lang, key, k)}
                    <td class="col-20"
                        class:table-danger={lang !== 'cs' && lang !== 'sk' && cs === v}
                        class:table-warning={lang !== 'en' && lang !== 'cs' && en === v || lang === 'sk' && cs === v}>
                        {v}
                    </td>
                {/each}
            </tr>
        {:else}
            {@render group(key ? key + '.' + k : k, cast(v))}
        {/if}
    {/each}
{/snippet}

<div class="overflow-x-auto">
    <table class="table text-break table-striped table-hover" style="width: max-content; max-width: min(400vw, 2000px)">
        <thead>
        <tr>
            <th>ID</th>
            {#each languageCodes as lang}
                <th>{lang.toUpperCase()}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
            {@render group('', cs)}
        </tbody>
    </table>
</div>

<style>
    .col-20 {
        width: 20%;
    }
</style>