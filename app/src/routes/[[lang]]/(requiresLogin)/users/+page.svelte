<script lang="ts">
    import { people } from '$lib/client/db/arrays';
    import type { PageProps } from './$types';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irWholeName } from '$lib/helpers/ir';
    import Search from '$lib/components/widgets/Search.svelte';
    import { derived } from 'svelte/store';
    import db from '$lib/client/db';
    import { newSearchWidget } from '$lib/forms/Widget';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Trash } from '@lucide/svelte';
    import { Item, ItemContent, ItemSeparator, ItemTitle, ItemActions } from '$lib/components/ui/item';

    const { data }: PageProps = $props();

    const { translations: t, irid, ir } = $derived(data);

    onMount(() => setTitle(t.users.title, true));

    const w = newSearchWidget({
        items: derived(people, l => l == 'loading' ? l : l.map(i => i.email)),
        getSearchItem: i => ({
            pieces: [{ text: i }],
        }),
        required: false,
        label: t => t.users.email,
        type: 'email',
    });
    let v = $state(w.defaultValue);
</script>

{#if $ir && irid}
    <h3 class="m-0">{irWholeName($ir.IN)}</h3>

    <div class="flex items-end gap-4">
        <Search bind:value={v} widget={w} context={{}} {t} class="grow" showAllErrors={true} />
        <Button
            onclick={() => {
                if (!v) return;
                db.updateUsersWithAccessToIR(irid, [...new Set([...$ir.meta.usersWithAccess, v])]);
                v = null;
            }}
        >
            {t.users.addUser}
        </Button>
    </div>
    <div>
        {#each $ir.meta.usersWithAccess as user}
            <Item>
                <ItemContent>
                    <ItemTitle>{user}</ItemTitle>
                </ItemContent>
                <ItemActions>
                    <Button
                        class="text-danger"
                        variant="ghost"
                        onclick={() => {
                            db.updateUsersWithAccessToIR(irid, $ir.meta.usersWithAccess.toSpliced($ir.meta.usersWithAccess.indexOf(user), 1));
                        }}
                        aria-label={t.users.remove}
                    >
                        <Trash />
                    </Button>
                </ItemActions>
            </Item>
            <ItemSeparator />
        {/each}
    </div>
{/if}
