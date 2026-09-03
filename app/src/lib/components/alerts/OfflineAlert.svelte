<script lang="ts">
    import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { WifiOff } from '@lucide/svelte';

    const { title, description }: {
        title: string;
        description?: string;
    } = $props();
</script>

<Alert variant="danger">
    <WifiOff />
    <AlertTitle>{title}</AlertTitle>
    {#if description}
        <AlertDescription>{description}</AlertDescription>
    {/if}
</Alert>