<script lang="ts">
    import { isUserAdmin } from '$lib/client/auth';
    import type { Deleted, IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { datetimeFromISO } from '$lib/helpers/date';
    import { aA } from '$lib/helpers/stores';
    import { Timestamp } from 'firebase/firestore';
    import Icon from '$lib/components/Icon.svelte';

    const { ir }: {
        ir: IR | Deleted<IRID>,
    } = $props();
</script>
{#if $isUserAdmin && ir}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#if 'createdBy' in ir && ir.createdBy && !ir.createdBy.isFake}
            <span>
                <Icon icon="add" />
                Vytvořil: {ir.createdBy.email}{$aA}
            </span>
        {/if}
        {#if 'createdAt' in ir && ir.createdAt && !('_seconds' in ir.createdAt)}
            {@const date = new Timestamp(ir.createdAt.seconds, ir.createdAt.nanoseconds).toDate()}
            <span>
                <Icon icon="add" />
                Vytvořeno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if 'changedAt' in ir && ir.changedAt && !('_seconds' in ir.changedAt)}
            {@const date = new Timestamp(ir.changedAt.seconds, ir.changedAt.nanoseconds).toDate()}
            <span>
                <Icon icon="edit" />
                Změněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
        {#if 'deletedAt' in ir && ir.deletedAt && !('_seconds' in ir.deletedAt)}
            {@const date = new Timestamp(ir.deletedAt.seconds, ir.deletedAt.nanoseconds).toDate()}
            <span>
                <Icon icon="delete" />
                Odstraněno: {datetimeFromISO(date.toISOString())} UTC{$aA}
            </span>
        {/if}
    </div>
{/if}