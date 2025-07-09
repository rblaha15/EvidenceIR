<script lang="ts">
    export type Props = { name: string | undefined, email: string, note: string }
    const { name, email, note }: Props = $props();
</script>

{note}

{#if name}
    <p>{name}</p>
{:else}
    <p>Odesílatel: {email}</p>
{/if}