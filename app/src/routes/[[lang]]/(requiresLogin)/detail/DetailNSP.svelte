<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl, spidUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { storable } from '$lib/helpers/stores';
    import NSP from '$lib/forms/NSP/infoNSP';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import db from '$lib/client/data';
    import { goto } from '$app/navigation';
    import type { LanguageCode } from '$lib/languages';
    import { type Translations } from '$lib/translations';
    import { defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
    import type { Raw } from '$lib/forms/Form';
    import type { IRID, SPID } from '$lib/helpers/ir';
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import defaultSP from '$lib/forms/SP/defaultSP';
    import type { FormSP } from '$lib/forms/SP/formSP.svelte';
    import { dataToRawData } from '$lib/forms/Form.js';

    const { t, sp, spid, lang }: {
        t: Translations, sp: Raw<FormNSP>, spid: SPID, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);

    const protocolGroups: (keyof Raw<FormSP>)[] = defaultSP().keys();

    const newIRID = new InputWidget({
        label: 'detail.newIRIDLabel',
    });
    const transfer = async () => {
        if (!sp) return;
        await db.addServiceProtocol(newIRID.value as IRID, sp.pick(...protocolGroups) as Raw<FormSP>);
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const newSP = {
            ...dataToRawData(defaultNSP()),
            ...sp.omit(...protocolGroups),
        };
        storable<typeof sp>(NSP.storeName).set(newSP);
    };
</script>

<div class="d-flex flex-column gap-1 align-items-sm-start">
    <a class="btn btn-primary" href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${sp.koncovyUzivatel.email}`)} tabindex="0">
        {td.sendDocuments}
    </a>

    <a class="btn btn-primary" href={relUrl(`/NSP?view-spid=${spid}`)} tabindex="0">
        {td.viewFilledData}
    </a>

    <PDFLink data={sp} hideLanguageSelector={true} {lang} link="NSP" {spid} {t} />

    <a class="btn btn-warning" href={relUrl('/NSP')} onclick={createCopy}>{td.copyNSP}</a>
</div>

{#if $isUserAdmin}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <Widget widget={newIRID} {t} data={{}} />
        <button class="btn btn-danger d-block" onclick={transfer}>{td.transferProtocol}</button>

        <button class="btn btn-danger d-block" onclick={() => {
            db.deleteIndependentProtocol(spid);
            goto(spidUrl(`/detail?deleted`), { replaceState: true });
        }}>
            {td.deleteProtocol}
        </button>
    </div>
{/if}