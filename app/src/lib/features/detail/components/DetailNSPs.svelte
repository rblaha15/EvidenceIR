<script lang="ts">
    import { detailUrlIR, detailUrlNSP, relUrl } from '$lib/helpers/runes.svelte.js';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { defaultNSP } from '$lib/forms/NSP/formNSP';
    import { defaultValues, type Raw, valuesToRawData } from '$lib/forms/Form';
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
    import db from '$lib/client/db';
    import { newInputWidget } from '$lib/forms/Widget';
    import { Copy, FileSymlink, HousePlus, MailOpen } from '@lucide/svelte';
    import { Button } from "$lib/components/ui/button";

    const { t, nsps, lang }: {
        t: Translations, nsps: NSP[], lang: LanguageCode,
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
            ...nsps
                .map(nsp => nsp.deleted ? undefined : nsp).filterNotUndefined()
                .map(nsp => nsp.NSP.pick(...protocolGroups) as Raw<FormSP>),
        );
        await goto(detailUrlIR(newIRID as IRID), { replaceState: true });
    };

    const createCopy = () => {
        const nsp = nsps[0] as ExistingNSP;
        const newNSP = {
            ...valuesToRawData(defaultNSP(), defaultValues(defaultNSP())),
            ...nsp.NSP.omit(...protocolGroups),
            ...nsp.NSP.pick('system'),
        };
        storable<typeof nsps[0]['NSP']>(infoNSP.storeName({})).set(newNSP);
    };
    const createCopyIN = () => {
        const nsp = nsps[0] as ExistingNSP;
        const newIN = {
            ...valuesToRawData(defaultIN(), defaultValues(defaultIN())),
            ...nsp.NSP.omit(...protocolGroups),
        };
        storable<Raw<FormIN>>(IN.storeName({ draft: false })).set(newIN);
    };
    const mf = $derived(nsps[0].NSP.montazka.email == unknownCompanyEmail ? '' : nsps[0].NSP.montazka.email.trim());
</script>

<div class="flex flex-wrap gap-4 justify-between">
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 sm:items-start">
            {#each nsps as sp}
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

    {#if !nsps[0].deleted}
        <div class="flex flex-col gap-4 sm:items-start">
            <Button href={relUrl(`/OD?redirect=${detailUrlNSP()}&user=${endUserEmails(nsps[0].NSP.koncovyUzivatel).join(';')}&assembly=${mf}`)}>
                <MailOpen />
                {td.sendDocuments}
            </Button>

            <Button variant="warning" href={relUrl('/NSP')} onclick={createCopy}>
                <Copy />
                {td.copyNSP}
            </Button>

            {#if $isUserAdmin}
                <Button variant="warning" href={relUrl('/IN')} onclick={createCopyIN}>
                    <HousePlus />
                    {td.copyNSPtoInstallation}{$aA}
                </Button>

                <div class="flex flex-col gap-1 sm:items-start">
                    <Widget {widget} bind:value={newIRID} {t} context={{}} {showAllErrors} />
                    <Button variant="danger" onclick={transfer}>
                        <FileSymlink />
                        {td.transferProtocols}{$aA}
                    </Button>
                </div>
            {/if}
        </div>
    {/if}
</div>