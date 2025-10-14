<script lang="ts">
    import type { ClassValue } from 'svelte/elements';

    const { icon, class: klass }: {
        icon: string | undefined | null, class?: ClassValue,
    } = $props();
</script>

{#if icon}
    <span class={["material-icons", klass]} translate="no">{icon}</span>
{/if}

<!--suppress CssUnusedSymbol -->
<style>
    :global.material-icons {
        vertical-align: -.25em;
        font-size: 1.375em;
    }
</style>