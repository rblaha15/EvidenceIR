<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import db, { type Deleted } from '$lib/data';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { defaultNSP, type FormNSP } from '$lib/forms/NSP/formNSP';
    import { dataToRawData, type Raw } from '$lib/forms/Form';
    import { type IRID, isSPDeleted, type SPID } from '$lib/helpers/ir';
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import defaultSP from '$lib/forms/SP/defaultSP';
    import type { FormSP } from '$lib/forms/SP/formSP.svelte';
    import DetailNSP from './DetailNSP.svelte';
    import { aA, storable } from '$lib/helpers/stores';
    import NSP from '$lib/forms/NSP/infoNSP';
    import IN from '$lib/forms/IN/infoIN';
    import Icon from '$lib/components/Icon.svelte';
    import type { FormIN } from '$lib/forms/IN/formIN';
    import defaultIN from '$lib/forms/IN/defaultIN';
    import type { LanguageCode } from '$lib/languageCodes';

    const { t, sps, lang }: {
        t: Translations, sps: [Raw<FormNSP>, ...(Raw<FormNSP> | Deleted<SPID>)[]], lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);

    const protocolGroups: (keyof Raw<FormSP>)[] = defaultSP().keys();

    const newIRID = new InputWidget({
        label: t => t.detail.newIRIDLabel,
    });
    const transfer = async () => {
        await sps
            .map(sp => isSPDeleted(sp) ? undefined : sp).filterNotUndefined()
            .map(sp => db.addServiceProtocol(newIRID.value as IRID, sp.pick(...protocolGroups) as Raw<FormSP>))
            .awaitAll();
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const newSP = {
            ...dataToRawData(defaultNSP()),
            ...sps[0].omit(...protocolGroups),
            ...sps[0].pick('system'),
        };
        storable<typeof sps[0]>(NSP.storeName({})).set(newSP);
    };
    const createCopyIN = () => {
        const newIN = {
            ...dataToRawData(defaultIN()),
            ...sps[0].omit(...protocolGroups),
        };
        storable<Raw<FormIN>>(IN.storeName({ draft: false })).set(newIN);
    };
</script>

<div class="d-flex flex-wrap gap-3 justify-content-between">
    <div class="d-flex flex-column gap-3">
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#each sps as sp}
                {#if !isSPDeleted(sp)}
                    <DetailNSP {sp} {lang} {t} />
                {:else}
                    <div class="d-flex gap-3 align-items-center flex-wrap">
                        <span>{sp.id.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}</span>
                        <span>{td.deletedNSP}</span>
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    <div class="d-flex flex-column gap-3 align-items-sm-start">
        <a class="btn btn-primary" href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${sps[0].koncovyUzivatel.email}`)} tabindex="0">
            <Icon icon="attach_email" />
            {td.sendDocuments}
        </a>

        <a class="btn btn-warning" href={relUrl('/NSP')} onclick={createCopy}>
            <Icon icon="file_copy" />
            {td.copyNSP}
        </a>

        {#if $isUserAdmin}
            <a class="btn btn-warning" href={relUrl('/IN')} onclick={createCopyIN}>
                <Icon icon="add_home_work" />
                {td.copyNSPtoInstallation}{$aA}
            </a>

            <div class="d-flex flex-column gap-1 align-items-sm-start">
                <Widget widget={newIRID} {t} data={{}} />
                <button class="btn btn-danger d-block" onclick={transfer}>
                    <Icon icon="drive_file_move" />
                    {td.transferProtocols}{$aA}
                </button>
            </div>
        {/if}
    </div>
</div>