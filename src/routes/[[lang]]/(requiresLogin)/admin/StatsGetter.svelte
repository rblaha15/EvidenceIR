<script lang="ts">
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { getToken } from '$lib/client/auth';
    import { dateFromISO, dayISO } from '$lib/helpers/date';
    import { adminDescriptions, type LoyaltyPointRewardType, type LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import { datetimeFromISO } from '$lib/helpers/date.ts';

    let from = $state(new InputWidget({
        type: 'date', label: 'Od (včetně)', text: dayISO(),
    }));
    let to = $state(new InputWidget({
        type: 'date', label: 'Do (vyjma)', text: dayISO(),
    }));

    const cs = getTranslations('cs');

    let results = $state<Record<string, number>>({});
    let currentRange = $state<[string, string]>(['', '']);

    let resultsLP = $state<Record<string, LoyaltyProgramUserData>>({});

    const search = async () => {
        const token = await getToken();
        const response = await fetch(`/api/stats?from=${from.value}&to=${to.value}&token=${token}&type=protocols`);
        results = await response.json();
        currentRange = [dateFromISO(from.value), dateFromISO(to.value)];
    };

    const searchLP = async () => {
        const token = await getToken();
        const response = await fetch(`/api/stats?token=${token}&type=loyalty`);
        resultsLP = await response.json();
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

<h2>Statistiky a historie věrnostních bodů uživatelů</h2>

<button class="btn btn-primary" onclick={searchLP}>
    Vyhledat
</button>

{#if resultsLP.entries().length}
    {#each resultsLP.entries() as [email, data]}
        <details>
            <summary><a href="#users-{email}">{email}</a>: {data.points.toLocaleString('cs')}</summary>
            {#each data.history as entry}
                {#if entry.type === 'other'}
                    <p class="m-0">{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {entry.note}</p>
                {:else}
                    <p class="m-0">{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {adminDescriptions[entry.type]} {#if entry.irid}u <a href="{detailIrUrl(entry.irid)}">{entry.irid}</a>{/if} {#if entry.note}({entry.note}){/if}</p>
                {/if}
            {/each}
        </details>
    {/each}
{/if}