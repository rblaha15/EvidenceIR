<script lang="ts" generics="D">
    import type { Translations } from '$lib/translations';
    import {
        DvojVybiratkova,
        MultiZaskrtavatkova,
        Nadpisova,
        Pisatkova, Pocitatkova,
        Prepinatkova,
        Radiova, SearchWidget,
        Textova,
        type Vec,
        Vybiratkova, Zaskrtavatkova,
    } from '$lib/Vec.svelte';
    import Pisatko from '$lib/components/veci/Pisatko.svelte';
    import DvojVybiratko from '$lib/components/veci/DvojVybiratko.svelte';
    import Vybiratko from '$lib/components/veci/Vybiratko.svelte';
    import Radio from '$lib/components/veci/Radio.svelte';
    import Prepinatko from '$lib/components/veci/Prepinatko.svelte';
    import MultiZaskrtavatko from '$lib/components/veci/MultiZaskrtavatko.svelte';
    import Zaskrtavatko from '$lib/components/veci/Zaskrtavatko.svelte';
    import Pocitatko from '$lib/components/veci/Pocitatko.svelte';
    import Search from '../../routes/[[lang]]/(requiresLogin)/search/Search.svelte';

    interface Props {
        t: Translations;
        vec: Vec<D, unknown>;
        data: D;
    }

    let { t, vec = $bindable(), data }: Props = $props();
</script>

{#if vec instanceof Nadpisova && vec.zobrazit(data)}
    <h2>{t.get(vec.nazev(data))}</h2>
{:else if vec instanceof Textova && vec.zobrazit(data)}
    <p class="mb-2">{t.get(vec.nazev(data))}</p>
{:else if vec instanceof Pisatkova && vec.zobrazit(data)}
    <Pisatko bind:vec {t} {data} />
{:else if vec instanceof DvojVybiratkova && vec.zobrazit(data)}
    <DvojVybiratko bind:vec {t} {data} />
{:else if vec instanceof Vybiratkova && vec.zobrazit(data)}
    <Vybiratko bind:vec {t} {data} />
{:else if vec instanceof Radiova && vec.zobrazit(data)}
    <Radio bind:vec {t} {data} />
{:else if vec instanceof Prepinatkova && vec.zobrazit(data)}
    <Prepinatko bind:vec {t} {data} />
{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit(data)}
    <MultiZaskrtavatko {t} bind:vec {data} />
{:else if vec instanceof Zaskrtavatkova && vec.zobrazit(data)}
    <Zaskrtavatko {t} bind:vec {data} />
{:else if vec instanceof Pocitatkova && vec.zobrazit(data)}
    <Pocitatko {t} bind:vec {data} />
{:else if vec instanceof SearchWidget && vec.zobrazit(data)}
    <Search {t} bind:widget={vec} {data} />
{/if}