<script lang="ts">
    import { Alert, AlertAction, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { OctagonAlert } from '@lucide/svelte';
    import type { Snippet } from 'svelte';
    import type { ClassValue } from 'svelte/elements';

    const { title, description, children, class: klass, action, noicon }: {
        noicon?: boolean;
        title: string | Snippet;
        description?: string;
        children?: Snippet;
        class?: ClassValue;
        action?: {
            text: string;
            onclick: () => void;
        };
    } = $props();
</script>

<Alert class={klass} variant="danger">
    {#if !noicon}
        <OctagonAlert />
    {/if}
    <AlertTitle>
        {#if title instanceof Function}
            {@render title()}
        {:else}
            {title}
        {/if}
    </AlertTitle>
    {#if description || children}
        <AlertDescription>
            {#if description}{description}{/if}
            {#if children}{@render children()}{/if}
        </AlertDescription>
    {/if}
    {#if action}
        <AlertAction>
            <Button variant="ghost" onclick={action.onclick}>{action.text}</Button>
        </AlertAction>
    {/if}
</Alert>