<script lang="ts">
    import type { Template } from '$lib/helpers/templates.js';
    import { languageCodes } from '$lib/languages';
    import { allKeys, getTranslations } from '$lib/translations';

    const parseSelf = <T extends (number | string)[]>(template: Template<T>) => template(
        template.keys.associateWith<T[number], string>(it => `{${it}}`),
    );
</script>

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
        {#each allKeys as tr}
            <tr>
                <th>{tr}</th>
                {#each languageCodes as lang}
                    {@const v = getTranslations(lang).get(tr)}
                    {@const cs = getTranslations('cs').get(tr)}
                    {@const en = getTranslations('en').get(tr)}
                    <td class="col-20"
                        class:table-danger={lang !== 'cs' && lang !== 'sk' && cs === v}
                        class:table-warning={lang !== 'en' && lang !== 'cs' && en === v || lang === 'sk' && cs === v}>
                        {#if typeof v === 'string'}
                            {v}
                        {:else}
                            {parseSelf(v)}
                        {/if}
                    </td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    .col-20 {
        width: 20%;
    }
</style>