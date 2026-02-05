<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { defaultNSP } from '$lib/forms/NSP/formNSP';
    import { dataToRawData, type Raw } from '$lib/forms/Form';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import defaultSP from '$lib/forms/SP/defaultSP';
    import type { FormSP } from '$lib/forms/SP/formSP.svelte';
    import DetailNSP from './DetailNSP.svelte';
    import { aA, storable } from '$lib/helpers/stores';
    import infoNSP from '$lib/forms/NSP/infoNSP';
    import IN from '$lib/forms/IN/infoIN';
    import Icon from '$lib/components/Icon.svelte';
    import type { FormIN } from '$lib/forms/IN/formIN';
    import defaultIN from '$lib/forms/IN/defaultIN';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingNSP, NSP } from '$lib/data';
    import db from '$lib/Database';

    const { t, sps, lang }: {
        t: Translations, sps: NSP[], lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);

    const protocolGroups: (keyof Raw<FormSP>)[] = defaultSP().keys();

    const newIRID = new InputWidget({
        label: t => t.detail.newIRIDLabel,
    });
    const transfer = async () => {
        await sps
            .map(sp => sp.deleted ? undefined : sp).filterNotUndefined()
            .map(sp => db.addServiceProtocol(newIRID.value as IRID, sp.NSP.pick(...protocolGroups) as Raw<FormSP>))
            .awaitAll();
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const sp = sps[0] as ExistingNSP;
        const newSP = {
            ...dataToRawData(defaultNSP()),
            ...sp.NSP.omit(...protocolGroups),
            ...sp.NSP.pick('system'),
        };
        storable<typeof sps[0]['NSP']>(infoNSP.storeName({})).set(newSP);
    };
    const createCopyIN = () => {
        const sp = sps[0] as ExistingNSP;
        const newIN = {
            ...dataToRawData(defaultIN()),
            ...sp.NSP.omit(...protocolGroups),
        };
        storable<Raw<FormIN>>(IN.storeName({ draft: false })).set(newIN);
    };
</script>

<div class="d-flex flex-wrap gap-3 justify-content-between">
    <div class="d-flex flex-column gap-3">
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#each sps as sp}
                {#if !sp.deleted}
                    <DetailNSP {sp} {lang} {t} />
                {:else}
                    <div class="d-flex gap-3 align-items-center flex-wrap">
                        <span>{sp.meta.id.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}</span>
                        <span>{td.deletedNSP}</span>
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    {#if !sps[0].deleted}
        <div class="d-flex flex-column gap-3 align-items-sm-start">
            <a class="btn btn-primary"
               href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${endUserEmails(sps[0].NSP.koncovyUzivatel).join(';')}`)} tabindex="0">
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
    {/if}
</div>