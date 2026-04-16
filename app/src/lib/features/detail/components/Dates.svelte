<script lang="ts">
    import { isUserAdmin } from '$lib/client/auth';
    import type { IR, NSP } from '$lib/data';
    import { dateFromTimestamp, datetimeFromISO } from '$lib/helpers/date';
    import { aA } from '$lib/helpers/stores';
    import Icon from '$lib/components/Icon.svelte';

    const { data }: {
        data: IR | NSP,
    } = $props();
</script>

{#if $isUserAdmin && data}
    <div class="flex flex-col gap-1 sm:items-start">
        {#if 'createdBy' in data.meta && data.meta.createdBy && !('IN' in data && data.meta.createdBy.isFake)}
            <span>
                <Icon icon="add" />
                Vytvořil: {data.meta.createdBy.email}{$aA}
            </span>
        {/if}
        {#if 'createdAt' in data.meta && data.meta.createdAt && !('_seconds' in data.meta.createdAt)}
            {@const date = dateFromTimestamp(data.meta.createdAt)}
            <span>
                <Icon icon="add" />
                Vytvořeno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if 'changedAt' in data.meta && data.meta.changedAt && !('_seconds' in data.meta.changedAt)}
            {@const date = dateFromTimestamp(data.meta.changedAt)}
            <span>
                <Icon icon="edit" />
                Změněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if data.deleted && 'deletedAt' in data.meta && data.meta.deletedAt && !('_seconds' in data.meta.deletedAt)}
            {@const date = dateFromTimestamp(data.meta.deletedAt)}
            <span>
                <Icon icon="delete" />
                Odstraněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
    </div>
{/if}