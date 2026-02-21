<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import type { IRID } from '$lib/helpers/ir';
    import { defaultDK, type FormPartDK, initDK, saveDK } from '$lib/forms/DK/formDK';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { aA, iaA } from '$lib/helpers/stores';
    import { dateFromISO } from '$lib/helpers/date';
    import ModalDK from '$lib/features/detail/components/detailIR/ModalDK.svelte';
    import { getDKInfo } from '$lib/features/detail/domain/detailIR/DK';
    import { downloadXML } from '$lib/features/detail/actions/detailIR/ir';
    import Button from '$lib/components/Button.svelte';

    const { t, ir, type }: {
        t: Translations, ir: IR, irid: IRID, type: 'TČ' | 'SOL'
    } = $props();
    const tr = $derived(t.dk);

    const { settings, show, commissionDate } = $derived(getDKInfo(type, ir));
</script>

{#if show}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <Button color="info" icon="alarm" text={tr.settingsTitle(type)}
                modalID="recommendations{type}Modal" />
        {#if $isUserAdmin && settings?.code}
            <Button color="secondary" icon="cloud_circle" text="{t.detail.openInDatabase}{iaA}"
                    href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Frk~2F{settings?.code}"
                    target="_blank" />
        {/if}
        {#if commissionDate}
            <span>{tr.commissionedAt(type)}: {dateFromISO(commissionDate)}</span>
        {/if}
    </div>

    <ModalDK {t} {ir} {type} />
{/if}