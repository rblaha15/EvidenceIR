<script lang="ts">
    import { isUserAdmin } from '$lib/client/auth';
    import type { IR, NSP } from '$lib/data';
    import { dateFromTimestamp, datetimeFromISO } from '$lib/helpers/date';
    import { aA } from '$lib/helpers/stores';
    import { Pencil, Plus, Trash2 } from "@lucide/svelte";

    const { data }: {
        data: IR | NSP,
    } = $props();
</script>

{#if $isUserAdmin && data}
    <div class="flex flex-col gap-1 sm:items-start">
        {#if 'createdBy' in data.meta && data.meta.createdBy && !('IN' in data && data.meta.createdBy.isFake)}
            <span>
                <Plus />
                Vytvořil: {data.meta.createdBy.email}{$aA}
            </span>
        {/if}
        {#if 'createdAt' in data.meta && data.meta.createdAt && !('_seconds' in data.meta.createdAt)}
            {@const date = dateFromTimestamp(data.meta.createdAt)}
            <span>
                <Plus />
                Vytvořeno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if 'changedAt' in data.meta && data.meta.changedAt && !('_seconds' in data.meta.changedAt)}
            {@const date = dateFromTimestamp(data.meta.changedAt)}
            <span>
                <Pencil />
                Změněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if data.deleted && 'deletedAt' in data.meta && data.meta.deletedAt && !('_seconds' in data.meta.deletedAt)}
            {@const date = dateFromTimestamp(data.meta.deletedAt)}
            <span>
                <Trash2 />
                Odstraněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
    </div>
{/if}