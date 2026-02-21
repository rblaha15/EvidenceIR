<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type ExistingIR } from '$lib/data';
    import { type IRID, irName, supportsRemoteAccess } from '$lib/helpers/ir';
    import { currentUser, isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { aA, aR } from '$lib/helpers/stores';
    import PDFLink from './PDFLink.svelte';
    import { detailIrUrl, iridUrl } from '$lib/helpers/runes.svelte.js';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import { hasRKTL, isRKTL } from '$lib/forms/RKT/infoRKT';
    import type { LanguageCode } from '$lib/languageCodes';
    import { blahova, defaultAddresses, sendEmail } from '$lib/client/email';
    import MailProtocol from '$lib/emails/MailProtocol.svelte';
    import { page } from '$app/state';
    import type { TC } from '$lib/forms/IN/defaultIN';
    import { goto } from '$app/navigation';
    import db from '$lib/Database';
    import { showNNR, showRR } from '$lib/features/detail/domain/documentsIR/documentLinkRules';
    import RefsiteModal from '$lib/features/detail/components/documentsIR/RefsiteModal.svelte';
    import RefsiteModals from '$lib/features/detail/components/documentsIR/RefsiteModals.svelte';
    import { createDocumentLinks } from '$lib/features/detail/domain/documentsIR/createDocumentLinks';
    import { pdfInfo } from '$lib/pdf/pdf';

    const { t, ir, irid, lang }: {
        t: Translations, ir: ExistingIR, irid: IRID, lang: LanguageCode
    } = $props();
    const td = $derived(t.detail);

    const links = $derived(
        createDocumentLinks(ir, t, { isAdmin: $isUserAdmin, isRegulusOrAdmin: $isUserRegulusOrAdmin })
    )
</script>

{#each links as link}
    {#if pdfInfo[link.link].type === ''}
        <PDFLink {t} {lang} data={{}} {...link} />
    {:else}
        <PDFLink {t} {lang} {irid} data={ir} {...link} />
    {/if}
{/each}

<RefsiteModals {ir} {irid} {td} />