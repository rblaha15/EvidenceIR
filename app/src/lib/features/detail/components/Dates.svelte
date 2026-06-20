<script lang="ts">
    import { isAdmin } from '$lib/client/auth';
    import type { IR, NSP } from '$lib/data';
    import { datetimeFromISO } from '$lib/helpers/date';
    import { aA } from '$lib/helpers/stores';
    import { Pencil, Plus, Trash2 } from "@lucide/svelte";

    const { data }: {
        data: IR | NSP,
    } = $props();
</script>

{#if $isAdmin && data}
    <div class="flex flex-col gap-1 sm:items-start">
        {#if 'createdBy' in data.meta && data.meta.createdBy && !('IN' in data && data.meta.createdBy.isFake)}
            <p class="flex gap-1">
                <Plus />
                Vytvořil: {data.meta.createdBy.email}{$aA}
            </p>
        {/if}
        {#if data.meta.createdAt}
            {@const date = new Date(data.meta.createdAt)}
            {#if !Number.isNaN(date.valueOf())}
                <p class="flex gap-1">
                    <Plus />
                    Vytvořeno: {datetimeFromISO(date.toISOString())} UTC{$aA}
                </p>
            {/if}
        {/if}
        {#if data.meta.changedAt}
            {@const date = new Date(data.meta.changedAt)}
            {#if !Number.isNaN(date.valueOf())}
                <p class="flex gap-1">
                    <Pencil />
                    Změněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
                </p>
            {/if}
        {/if}
        {#if data.deleted && data.meta.deletedAt}
            {@const date = new Date(data.meta.deletedAt)}
            {#if !Number.isNaN(date.valueOf())}
                <p class="flex gap-1">
                    <Trash2 />
                    Odstraněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
                </p>
            {/if}
        {/if}
    </div>
{/if}