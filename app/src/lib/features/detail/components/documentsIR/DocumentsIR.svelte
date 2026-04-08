<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type ExistingIR } from '$lib/data';
    import { type IRID } from '$lib/helpers/ir';
    import { currentUser, isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import PDFLink from './PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import RefsiteModals from '$lib/features/detail/components/documentsIR/RefsiteModals.svelte';
    import { createDocumentLinks } from '$lib/features/detail/domain/documentsIR/createDocumentLinks';
    import { pdfInfo } from '$lib/pdf/pdf';
    import { usersList } from '$lib/client/realtime';

    const { t, ir, irid, lang }: {
        t: Translations, ir: ExistingIR, irid: IRID, lang: LanguageCode
    } = $props();
    const td = $derived(t.detail);

    const user = $derived($usersList.find(u => u.email == $currentUser?.email))
    const allowUPT = $derived(user?.allowUPT ?? false)

    const links = $derived(
        createDocumentLinks(ir, t, { isAdmin: $isUserAdmin, isRegulusOrAdmin: $isUserRegulusOrAdmin, allowUPT })
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