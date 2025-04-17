<script lang="ts">
    import type { PageProps } from './$types';
    import FormComponent from '$lib/forms/Form.svelte';
    import { nazevFirmy } from '$lib/helpers/ares';
    import { formaSpolecnostiJeSpatne } from '$lib/helpers/ir';
    import sp2 from '$lib/forms/SP2';

    const { data }: PageProps = $props();
    const t = data.translations;
</script>

<FormComponent formInfo={sp2} {t} >
    {#snippet trailingContent(w, d, f)}
        {@const chosenAssemblyCompany = nazevFirmy(f.montazka.ico.value)}
        {@const chosenCommissioningCompany = nazevFirmy(f.uvedeni.ico.value)}

        {#if w === f.montazka.ico && w.show(d)}
            <p>
                {#await chosenAssemblyCompany then a}
                    {#if a}
                        {t.chosenCompany}: {a}
                    {/if}
                {/await}
            </p>
        {/if}
        {#if w === f.uvedeni.ico && w.show(d)}
            <p>
                {#await chosenCommissioningCompany then c}
                    {#if c}
                        {t.chosenCompany}: {c}
                    {/if}
                {/await}
            </p>
        {/if}
    {/snippet}
</FormComponent>