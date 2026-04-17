<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DisplayableHistoryEntry, readableHistory } from '$lib/client/history.svelte';
    import Button from '$lib/components/Button.svelte';
    import { Database, Mail } from '@lucide/svelte';

    const { t }: { t: Translations } = $props();
    const th = $derived(t.nav.history)
</script>

{#snippet changes(list: DisplayableHistoryEntry[])}
    <ul class="list-group list-group-flush list-group">
        {#each list as entry}
            <li class="list-group-item flex flex-col gap-1 px-0">
                <span class="">{entry.datetime}</span>
                <div class="flex gap-4 items-center">
                    {#if entry.type === 'database'}
                        <Database size={48} />
                    {:else}
                        <Mail size={48} />
                    {/if}
                    <span class="grow">{entry.subject(t)}</span>
                </div>
            </li>
        {/each}
    </ul>
{/snippet}

<div class="modal fade hidden" id="history" tabindex="-1" aria-labelledby="historyLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="historyLabel">{th.title}</h4>
                <Button label={th.close} class="btn-close" dismissModal />
            </div>

            <div class="modal-body flex flex-col gap-4">
                {#if $readableHistory.incompleted.length}
                    <p class="m-0">{th.description}</p>
                    <h5 class="m-0">{th.incompletedChanges}</h5>
                    {@render changes($readableHistory.incompleted)}
                {/if}
                <h5 class="m-0">{th.changes}</h5>
                {@render changes($readableHistory.completed)}
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                >{th.close}</button>
            </div>
        </div>
    </div>
</div>