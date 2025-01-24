<script lang="ts" generics="D">
    import type { Translations } from '$lib/translations';
    import { nazevSHvezdou, type MultiZaskrtavatkova } from '$lib/Vec.svelte';

    interface Props {
        t: Translations;
        vec: MultiZaskrtavatkova<D>;
        data: D;
    }

    let { t, vec = $bindable(), data }: Props = $props();

    const pocet = $derived(vec.value.length)
</script>

{#if vec.zobrazit(data)}
    <label class="d-block" for="">{nazevSHvezdou(vec, data, t)}</label>
    {#each vec.moznosti(data) as moznost}
        <div class="form-check">
            <label class="form-check-label">
                {t.get(moznost)}
                <input type="checkbox" disabled={!vec.value.includes(moznost) && pocet >= vec.max(data)} class="form-check-input" value={moznost} bind:group={vec.value} />
            </label>
        </div>
    {/each}

    {#if vec.zobrazitError(data)}
        <p class="text-danger">{t.get(vec.onError(data))}</p>
    {/if}

    <div class="mb-3"></div>
{/if}
