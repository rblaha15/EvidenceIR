<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type ExistingIR } from '$lib/data';
    import { type IRID } from '$lib/helpers/ir';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import PDFLink from './PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { createDocumentLinks } from '$lib/features/detail/domain/documentsIR/createDocumentLinks';
    import { pdfInfo } from '$lib/pdf/pdf';
    import { allowUPT } from '$lib/client/realtime';
    import type { TC } from "$lib/forms/IN/defaultIN";
    import RefsiteModal from "$lib/features/detail/components/documentsIR/RefsiteModal.svelte";

    const { t, ir, irid, lang }: {
        t: Translations, ir: ExistingIR, irid: IRID, lang: LanguageCode
    } = $props();
    const td = $derived(t.detail);

    let openedRefsiteModal = $state<TC>();

    const links = $derived(
        createDocumentLinks(
            ir, t,
            { isAdmin: $isUserAdmin, isRegulusOrAdmin: $isUserRegulusOrAdmin, allowUPT: $allowUPT },
            tc => openedRefsiteModal = tc,
        )
    )
</script>

{#each links as link}
    {#if pdfInfo[link.link].type === ''}
        <PDFLink {t} {lang} data={{}} {...link} />
    {:else}
        <PDFLink {t} {lang} {irid} data={ir} {...link} />
    {/if}
{/each}

<RefsiteModal {ir} {td} bind:openedRefsiteModal />