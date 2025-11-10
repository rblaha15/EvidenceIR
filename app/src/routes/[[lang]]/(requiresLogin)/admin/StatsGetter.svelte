<script lang="ts">
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { getToken } from '$lib/client/auth';
    import { dateFromISO, dayISO } from '$lib/helpers/date';

    let from = $state(new InputWidget({
        type: 'date', label: 'Od (včetně)', text: dayISO(),
    }));
    let to = $state(new InputWidget({
        type: 'date', label: 'Do (vyjma)', text: dayISO(),
    }));

    const cs = getTranslations('cs');

    let results = $state<Record<string, number>>({});
    let currentRange = $state<[string, string]>(['', '']);

    const search = async () => {
        const token = await getToken();
        const response = await fetch(`/api/stats?from=${from.value}&to=${to.value}&token=${token}`);
        results = await response.json();
        currentRange = [dateFromISO(from.value), dateFromISO(to.value)];
    };
</script>

<div class="d-flex gap-1">
    <div class="flex-grow-1">
        <Widget bind:widget={from} data={undefined} t={cs} />
    </div>
    <div class="flex-grow-1">
        <Widget bind:widget={to} data={undefined} t={cs} />
    </div>
</div>

<button class="btn btn-primary" onclick={search}>
    Vyhledat
</button>

{#if currentRange[0]}
    <p class="m-0">Počty vytvořených protokolů od {currentRange[0]} do {currentRange[1]}:</p>

    {#if !results.entries().length}
        <p class="m-0">Žádné protokoly</p>
    {/if}

    <ul class="m-0">
        {#each results.entries() as [technician, count]}
            <li>{technician}: {count}</li>
        {/each}
    </ul>
{/if}