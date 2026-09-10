<script lang="ts">
    import { iaA } from '$lib/helpers/newStores';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { isAdmin } from '$lib/client/auth';
    import ModalDK from '$lib/features/detail/components/detailIR/ModalDK.svelte';
    import { getDKInfo } from '$lib/features/detail/domain/detailIR/DK';
    import { Button } from '$lib/components/ui/button';
    import { Server } from "@lucide/svelte";

    const { t, ir, type }: {
        t: Translations, ir: IR, irid: IRID, type: 'TČ' | 'SOL'
    } = $props();

    const { settings, show } = $derived(getDKInfo(type, ir));
</script>

{#if show}
    <div class="flex flex-col gap-1 sm:items-start">
        {#if show && ir}
            <ModalDK {t} {ir} {type} />
            {#if $isAdmin && settings?.code}
                <Button variant="secondary"
                        href={relUrl(`/admin#db-app/rk?query={"_id":${settings?.code}}`)}>
                    <Server /> {t.detail.openInDatabase}{iaA}
                </Button>
            {/if}
        {/if}
    </div>
{/if}