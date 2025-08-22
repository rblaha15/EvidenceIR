<script lang="ts">
    import type { STemplate, Template } from '$lib/helpers/templates.js';
    import { languageCodes } from '$lib/languages';
    import { getTranslations, type Translate, type Translations } from '$lib/translations';
    import cs from '$lib/translations/cs';
    import isString from 'lodash.isstring';

    type TranslationEntry1 = string | STemplate<(string | number)[]> | Record<string, unknown> | ((...args: unknown[]) => string);
    type Translations1 = Record<string, TranslationEntry1>
    type TranslationEntry2 = string | Template<(string | number)[]> | Record<string, unknown> | ((...args: unknown[]) => string);
    type Translations2 = Record<string, TranslationEntry2>

    type JointTranslations_<R extends Translations2> = {
        [K in keyof R]: R[K] extends Translations2
            ? JointTranslations_<R[K]>
            : Translate<R[K]>
    }

    type JointTranslations = JointTranslations_<Translations>

    const getJointTranslations = (r: Translations1 = cs, t: Translate<Translations2> = languageCodes.associateWith(getTranslations)): JointTranslations =>
        r.mapValues((k, v) => {
            const tr = t.mapValues((_, v) => v[k]);
            if (isString(v) || Array.isArray(v) || v instanceof Function) {
                return tr;
            } else {
                return getJointTranslations(v as Translations1, tr as Translate<Translations2>) as JointTranslations_<Translations2>;
            }
        }) as JointTranslations;

    export const jointTranslations = getJointTranslations()

    const parseSelf = <T extends (number | string)[]>(template: Template<T>) => template(
        template.keys.associateWith<T[number], string>(it => `{${it}}`),
    );
    const view = (t: Template<(string | number)[]> | string | Function) =>
        t instanceof Function ? 'strings' in t ? parseSelf(t) : t : t;
    const cast = (v: unknown) => v as JointTranslations
</script>

{#snippet group(key: String, gs: JointTranslations)}
    {#if key}
        <h3 class="p-3">{key}</h3>
    {/if}
    {#each gs.entries() as [k, v]}
        {#if 'cs' in v}
            <tr>
                <th>{k}</th>
                {#each v.entries() as [lang, t]}
                    <td class="col-20"
                        class:table-danger={lang !== 'cs' && lang !== 'sk' && view(v.cs) === view(t)}
                        class:table-warning={lang !== 'en' && lang !== 'cs' && view(v.en) === view(t) || lang === 'sk' && view(v.cs) === view(t)}>
                        {view(t)}
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
            {@render group('', jointTranslations)}
        </tbody>
    </table>
</div>

<style>
    .col-20 {
        width: 20%;
    }
</style>