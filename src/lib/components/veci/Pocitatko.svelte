<script lang="ts" generics="D">
    import type { Translations } from '$lib/translations';
    import { Pocitatkova } from '$lib/Vec.svelte';

    interface Props {
        t: Translations;
        vec: Pocitatkova<D>;
        data: D;
    }

    let { t, vec = $bindable(), data }: Props = $props();

</script>

{#if vec.zobrazit(data)}
    <p class="mb-1">{t.get(vec.nazev(data))}</p>
    <div class="d-flex flex-row mb-2 align-items-center">
        <button class="btn btn-sm btn-secondary" onclick={() => vec.value--}
                disabled={vec.value === vec.min(data)}>-</button>
        <span class="m-2">{vec.value}</span>
        <button class="btn btn-sm btn-secondary" onclick={() => vec.value++}
                disabled={vec.value === vec.max(data)}>+</button>
    </div>

    {#if vec.zobrazitError(data)}
        <span class="text-danger help-block">{t.get(vec.onError(data))}</span>
    {/if}
{/if}
