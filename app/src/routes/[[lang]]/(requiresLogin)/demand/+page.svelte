<script lang="ts">
    import type { PageProps } from './$types';
    import Form from '$lib/forms/Form.svelte';
    import formInfo from '$lib/forms/Demand';

    const { data }: PageProps = $props();
    const t = data.translations;
</script>

<Form {formInfo} {t}></Form>