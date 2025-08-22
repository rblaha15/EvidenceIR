<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import db from '$lib/data';
    import { goto } from '$app/navigation';
    import type { LanguageCode } from '$lib/languages';
    import { type Translations } from '$lib/translations';
    import { defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
    import { dataToRawData, type Raw } from '$lib/forms/Form';
    import type { IRID } from '$lib/helpers/ir';
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import defaultSP from '$lib/forms/SP/defaultSP';
    import type { FormSP } from '$lib/forms/SP/formSP.svelte';
    import DetailNSP from './DetailNSP.svelte';
    import { storable } from '$lib/helpers/stores';
    import NSP from '$lib/forms/NSP/infoNSP';

    const { t, sps, lang }: {
        t: Translations, sps: Raw<FormNSP>[], lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);

    const protocolGroups: (keyof Raw<FormSP>)[] = defaultSP().keys();

    const newIRID = new InputWidget({
        label: t => t.detail.newIRIDLabel,
    });
    const transfer = async () => {
        await sps.map(async sp => {
            await db.addServiceProtocol(newIRID.value as IRID, sp.pick(...protocolGroups) as Raw<FormSP>);
        }).awaitAll();
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const newSP = {
            ...dataToRawData(defaultNSP()),
            ...sps[0].omit(...protocolGroups),
        };
        storable<typeof sps[0]>(NSP.storeName).set(newSP);
    };
</script>

<div class="d-flex flex-column gap-3 align-items-sm-start">
    <a class="btn btn-primary" href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${sps[0].koncovyUzivatel.email}`)} tabindex="0">
        {td.sendDocuments}
    </a>

    {#each sps as sp}
        <DetailNSP {sp} {lang} {t} />
    {/each}

    <a class="btn btn-warning" href={relUrl('/NSP')} onclick={createCopy}>{td.copyNSP}</a>
</div>

{#if $isUserAdmin}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <Widget widget={newIRID} {t} data={{}} />
        <button class="btn btn-danger d-block" onclick={transfer}>{td.transferProtocol}</button>
    </div>
{/if}