<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import type { ExistingIR } from '$lib/data';
    import RecordManagement from '$lib/features/detail/components/detailIR/RecordManagement.svelte';
    import DocumentsIR from '$lib/features/detail/components/documentsIR/DocumentsIR.svelte';
    import { unknownCompany, unknownCRN } from '$lib/forms/IN/formIN';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import ares from '$lib/helpers/ares';
    import { type IRID } from '$lib/helpers/ir';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { type Translations } from '$lib/translations';
    import { Eye, FilePen } from '@lucide/svelte';
    import { readable } from 'svelte/store';
    import Dates from '../Dates.svelte';
    import ServiceProtocols from './ServiceProtocols.svelte';

    const { t, ir, lang, irid }: {
        t: Translations, ir: ExistingIR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    const pumps = $derived(
        cascadePumps(ir.IN)
            .map(pump => pump.model)
            .countElements()
            .mapTo((model, count) => count == 1 ? model : `${count}x ${model}`)
            .join(', ')
    );
    const crn = $derived(ir.IN.montazka.ico);
    const assembly = $derived(readable(crn, set => {
        if (crn == unknownCRN) set(unknownCompany(t).companyName);
        else ares.getName(crn).then(name => set(name || crn));
    }));
    const commissioning = $derived(ir.IN.uvedeni.zastupce);
</script>

<h4 class="flex flex-wrap gap-x-4 gap-y-1 text-lg">
    <span>{pumps}</span>
    <span>MF: {$assembly}</span>
    <span>UP: {commissioning}</span>
</h4>

<div class="flex flex-wrap lg:flex-nowrap gap-6 justify-between">
    <div class="flex flex-col gap-12 grow">
        <div class="flex flex-wrap gap-1">
            {#if ir.isDraft}
                <Button href={relUrl(`/IN?edit-irid=${irid}`)}>
                    <FilePen />
                    {td.finishRecord}
                </Button>
                <Button variant="secondary" href={relUrl(`/IN?view-irid=${irid}`)}>
                    <Eye />
                    {td.viewFilledData}
                </Button>
            {/if}
            {#if !ir.isDraft}
                <Button href={relUrl(`/IN?view-irid=${irid}`)}>
                    <Eye />
                    {td.viewAllData}
                </Button>
                <Button variant="warning" href={relUrl(`/IN?edit-irid=${irid}`)}>
                    <FilePen />
                    {td.edit}
                </Button>
            {/if}
        </div>

        {#if !ir.isDraft}
            <div class="flex flex-col gap-4">
                <h3>{td.documents}</h3>
                <div class="flex flex-col gap-1">
                    <DocumentsIR {ir} {t} {lang} {irid} />
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <ServiceProtocols {ir} {t} {lang} {irid} />
            </div>
        {/if}
    </div>
    <div class="flex flex-col gap-4 shrink sm:items-start">
        <RecordManagement {ir} {irid} {t} />

        <Dates data={ir} />
    </div>
</div>