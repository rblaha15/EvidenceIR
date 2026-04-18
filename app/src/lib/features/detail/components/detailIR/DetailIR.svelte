<script lang="ts">
    import { type IRID } from '$lib/helpers/ir';
    import { type Translations } from '$lib/translations';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import DocumentsIR from '$lib/features/detail/components/documentsIR/DocumentsIR.svelte';
    import Dates from '../Dates.svelte';
    import type { ExistingIR } from '$lib/data';
    import RecordManagement from "$lib/features/detail/components/detailIR/RecordManagement.svelte";

    const { t, ir, lang, irid }: {
        t: Translations, ir: ExistingIR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);
</script>

<div class="flex flex-wrap lg:flex-nowrap gap-6 justify-between">
    {#if !ir.isDraft}
        <div class="flex flex-col gap-12 grow">
            <div class="flex flex-col gap-4">
                <h3>{td.documents}</h3>
                <div class="flex flex-col gap-1">
                    <DocumentsIR {ir} {t} {lang} {irid} />
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <ServiceProtocols {ir} {t} {lang} {irid} />
            </div>
        </div>
    {/if}
    <div class="flex flex-col gap-4 shrink sm:items-start">
        <h3>{ir.isDraft ? td.draftManagement : td.recordManagement}</h3>
        <RecordManagement {ir} {irid} {t} />

        <Dates data={ir} />
    </div>
</div>