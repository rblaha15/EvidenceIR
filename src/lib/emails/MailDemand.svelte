<script lang="ts">
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import type { Form } from '$lib/forms/Form';
    import { type Translations } from '$lib/translations';
    import type { FormNK } from '$lib/forms/NK/formNK';

    const { user, data, t }: { user: string, data: FormNK, t: Translations } = $props();

    const list = $derived((data as Form<FormNK>).getValues().flatMap(obj => obj.getValues()));
</script>

<p>Prosím o přípravu nabídky.</p>
<p>Vyplnil: {user}</p>

{#each list as widget}
    <ReadonlyWidget {widget} {t} {data} />
{/each}
