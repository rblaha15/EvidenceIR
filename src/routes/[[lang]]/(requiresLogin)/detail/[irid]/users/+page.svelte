<script lang="ts">
    import type { PageData } from './$types';
    import { evidenceStore, type IRID, upravitUzivatele } from '$lib/client/firestore';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { irWholeName } from '$lib/helpers/ir';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;

    const irid = data.irid_spid as IRID;
    const ir = evidenceStore(irid);

    let email = $state('');

    setTitle('Uživatelé s přístupem k evidenci');
</script>

{#if !$ir}
    <div class="spinner-border text-danger"></div>
{:else}
    <h3>{irWholeName($ir.evidence)}</h3>

    <div class="d-flex align-items-center">
        <label class="form-floating flex-grow-1 me-2">
            <input type="email" class="form-control" placeholder={t.serialNumber} bind:value={email} />
            <label for="">Email</label>
        </label>
        <button
            class="btn btn-success"
            type="submit"
            onclick={() => {
				upravitUzivatele(irid, [...new Set([...$ir.users, email])]);
				email = '';
			}}>Přidat uživatele
        </button
        >
    </div>
    <div class="list-group list-group-flush">
        {#each $ir.users as user}
            <div class="list-group-item d-flex align-items-center">
                {user}
                <button
                    class="btn ms-2 text-danger"
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
