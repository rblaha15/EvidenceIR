<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { defaultNSP } from '$lib/forms/NSP/formNSP';
    import { type Raw, valuesToRawData, defaultValues } from '$lib/forms/Form';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import defaultSP from '$lib/forms/SP/defaultSP';
    import type { FormSP } from '$lib/forms/SP/formSP.svelte.js';
    import DetailNSP from './DetailNSP.svelte';
    import { aA, storable } from '$lib/helpers/stores';
    import infoNSP from '$lib/forms/NSP/infoNSP';
    import IN from '$lib/forms/IN/infoIN';
    import { type FormIN, unknownCompanyEmail } from '$lib/forms/IN/formIN';
    import defaultIN from '$lib/forms/IN/defaultIN';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingNSP, NSP } from '$lib/data';
    import db from '$lib/Database';
    import { newInputWidget } from '$lib/forms/Widget';
    import { Copy, FileSymlink, HousePlus, MailOpen } from '@lucide/svelte';

    const { t, sps, lang }: {
        t: Translations, sps: NSP[], lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);

    const protocolGroups: (keyof Raw<FormSP>)[] = defaultSP().keys();

    const widget = newInputWidget({ label: t => t.detail.newIRIDLabel });
    let newIRID = $state(widget.defaultValue);
    let showAllErrors = $state(false);
    const transfer = async () => {
        showAllErrors = true;
        if (widget.isError({}, newIRID)) return;
        await db.addSPs(
            newIRID as IRID,
            ...sps
                .map(sp => sp.deleted ? undefined : sp).filterNotUndefined()
                .map(sp => sp.NSP.pick(...protocolGroups) as Raw<FormSP>),
        );
        await goto(detailIrUrl(newIRID as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const sp = sps[0] as ExistingNSP;
        const newSP = {
            ...valuesToRawData(defaultNSP(), defaultValues(defaultNSP())),
            ...sp.NSP.omit(...protocolGroups),
            ...sp.NSP.pick('system'),
        };
        storable<typeof sps[0]['NSP']>(infoNSP.storeName({})).set(newSP);
    };
    const createCopyIN = () => {
        const sp = sps[0] as ExistingNSP;
        const newIN = {
                ...valuesToRawData(defaultIN(), defaultValues(defaultIN())),
            ...sp.NSP.omit(...protocolGroups),
        };
        storable<Raw<FormIN>>(IN.storeName({ draft: false })).set(newIN);
    };
    const mf = $derived(sps[0].NSP.montazka.email == unknownCompanyEmail ? '' : sps[0].NSP.montazka.email.trim());
</script>

<div class="flex flex-wrap gap-4 justify-content-between">
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 sm:items-start">
            {#each sps as sp}
                {#if !sp.deleted}
                    <DetailNSP {sp} {lang} {t} />
                {:else}
                    <div class="flex gap-4 items-center flex-wrap">
                        <span>{sp.meta.id.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}</span>
                        <span>{td.deletedNSP}</span>
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    {#if !sps[0].deleted}
        <div class="flex flex-col gap-4 sm:items-start">
            <a class="btn btn-primary"
               href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${endUserEmails(sps[0].NSP.koncovyUzivatel).join(';')}&assembly=${mf}`)} tabindex="0">
                <MailOpen />
                {td.sendDocuments}
            </a>

            <a class="btn btn-warning" href={relUrl('/NSP')} onclick={createCopy}>
                <Copy />
                {td.copyNSP}
            </a>

            {#if $isUserAdmin}
                <a class="btn btn-warning" href={relUrl('/IN')} onclick={createCopyIN}>
                    <HousePlus />
                    {td.copyNSPtoInstallation}{$aA}
                </a>

                <div class="flex flex-col gap-1 sm:items-start">
                    <Widget {widget} bind:value={newIRID} {t} context={{}} {showAllErrors} />
                    <button class="btn btn-danger block" onclick={transfer}>
                        <FileSymlink />
                        {td.transferProtocols}{$aA}
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</div>