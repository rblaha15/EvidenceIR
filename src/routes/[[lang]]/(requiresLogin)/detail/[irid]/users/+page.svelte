<script lang="ts">
    import type { PageData } from './$types';
    import { evidenceStore, type IRID, upravitUzivatele } from '$lib/client/firestore';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { irWholeName } from '$lib/helpers/ir';
    import { SearchWidget } from '$lib/Widget.svelte';
    import { p } from '$lib/translations';
    import Search from '$lib/components/widgets/Search.svelte';
    import { onMount } from 'svelte';
    import { seznamLidi, startLidiListening } from '$lib/client/realtime';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;

    const irid = data.irid_spid as IRID;
    const ir = evidenceStore(irid);

    setTitle('Uživatelé s přístupem k evidenci');

    let w = $state(new SearchWidget({
        label: 'email', type: 'email', items: [] as string[], getSearchItem: i => ({
            pieces: [
                { text: p(i) },
            ],
        }), required: false,
    }));

    onMount(async () => {
        await startLidiListening();
    });

    $effect(() => {
        w.items = () => $seznamLidi.map(i => i.email);
    });
</script>

{#if !$ir}
    <div class="spinner-border text-danger"></div>
{:else}
    <h3 class="m-0">{irWholeName($ir.evidence)}</h3>

    <div class="d-flex align-items-center gap-3">
        <Search bind:widget={w} data={undefined} {t} class="flex-grow-1" />
        <button
            class="btn btn-success"
            type="submit"
            onclick={() => {
                if (!w.value) return;
				upravitUzivatele(irid, [...new Set([...$ir.users, w.value])]);
				w.setValue(undefined, null);
			}}
        >Přidat uživatele
        </button>
    </div>
    <div class="list-group list-group-flush">
        {#each $ir.users as user}
            <div class="list-group-item d-flex align-items-center gap-3">
                {user}
                <button
                    class="btn text-danger"
                    onclick={() => {
						upravitUzivatele(irid, $ir.users.toSpliced($ir.users.indexOf(user), 1));
					}}
                    aria-label="Odstranit"
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
