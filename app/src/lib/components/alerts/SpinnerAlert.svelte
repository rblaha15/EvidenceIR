<script lang="ts">
    import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { Spinner } from '$lib/components/ui/spinner';

    const { title, description }: {
        title: string;
        description?: string;
    } = $props();
</script>

<Alert>
    <Spinner />
    <AlertTitle>{title}</AlertTitle>
    {#if description}
        <AlertDescription>{description}</AlertDescription>
    {/if}
</Alert>