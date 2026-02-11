<script lang="ts">
    import type { PageProps } from './$types';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irWholeName } from '$lib/helpers/ir';
    import { SearchWidget } from '$lib/forms/Widget.svelte.js';
        import Search from '$lib/components/widgets/Search.svelte';
    import { usersList } from '$lib/client/realtime';
    import { derived } from 'svelte/store';
    import db from '$lib/Database';

    const { data }: PageProps = $props();

    const { translations: t, irid, ir } = $derived(data)

    $effect(() => setTitle(t.users.title, true));

    let w = $state(new SearchWidget({
        items: derived(usersList, l => l.map(i => i.email)), getSearchItem: i => ({
            pieces: [
                { text: i },
            ],
        }), required: false, label: t => t.users.email, type: 'email',
    }));
</script>

{#if $ir && irid}
    <h3 class="m-0">{irWholeName($ir.IN)}</h3>

    <div class="d-flex align-items-center gap-3">
        <Search bind:widget={w} data={undefined} {t} class="flex-grow-1" />
        <button
            class="btn btn-success"
            type="submit"
            onclick={() => {
                if (!w.value) return;
				db.updateUsersWithAccessToIR(irid, [...new Set([...$ir.meta.usersWithAccess, w.value])]);
				w.setValue(undefined, null);
			}}
        >{t.users.addUser}</button>
    </div>
    <div class="list-group list-group-flush">
        {#each $ir.meta.usersWithAccess as user}
            <div class="list-group-item d-flex align-items-center gap-3">
                {user}
                <button
                    class="btn text-danger"
                    onclick={() => {
						db.updateUsersWithAccessToIR(irid, $ir.meta.usersWithAccess.toSpliced($ir.meta.usersWithAccess.indexOf(user), 1));
					}}
                    aria-label={t.users.remove}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
                        />
                    </svg>
                </button>
            </div>
        {/each}
    </div>
{/if}
