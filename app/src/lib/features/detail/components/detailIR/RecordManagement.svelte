<script lang="ts">
    import { isAdmin, isRegulusOrAdmin } from '$lib/client/auth';
    import { Button } from '$lib/components/ui/button';
    import type { ExistingIR } from '$lib/data';
    import { downloadXML } from '$lib/features/detail/actions/detailIR/ir';
    import DeleteIR from '$lib/features/detail/components/detailIR/DeleteIR.svelte';
    import { unknownCompanyEmail } from '$lib/forms/IN/formIN';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import { detailUrlIR, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { aR, iaA } from '$lib/helpers/stores';
    import { type Translations } from '$lib/translations';
    import { Download, MailOpen, Server, Users } from '@lucide/svelte';
    import DK from './DK.svelte';

    const { t, ir, irid }: {
        t: Translations, ir: ExistingIR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);
    const mf = $derived(ir.IN.montazka.email == unknownCompanyEmail ? '' : ir.IN.montazka.email.trim());
</script>

{#if !ir.isDraft || $isRegulusOrAdmin}
    <h3>{td.otherActions}</h3>
{/if}

<div class="flex flex-col gap-1 sm:items-start">
    {#if !ir.isDraft}
        <Button
            href={relUrl(`/OD?redirect=${detailUrlIR()}&user=${endUserEmails(ir.IN.koncovyUzivatel).join(';')}&assembly=${mf}`)}>
            <MailOpen /> {td.sendDocuments}
        </Button>
    {/if}
    {#if $isRegulusOrAdmin}
        <Button variant="tertiary" href={iridUrl('/users')}>
            <Users /> {td.usersWithAccess}{$aR}
        </Button>
    {/if}
    {#if $isRegulusOrAdmin && !ir.isDraft}
        <Button variant="secondary" onclick={downloadXML(ir)}>
            <Download /> {td.downloadXML}{$aR}
        </Button>
    {/if}
</div>

{#if $isAdmin}
    <div class="flex flex-col gap-1 sm:items-start">
        <DeleteIR {irid} {td} />

        <Button variant="secondary" href={relUrl(`/admin#db-app/ir?query={"meta.id":"${irid}"}`)}>
            <Server /> {td.openInDatabase}{iaA}
        </Button>
    </div>
{/if}

{#if !ir.isDraft}
    <DK {ir} {irid} {t} type="TČ" />
    <DK {ir} {irid} {t} type="SOL" />
{/if}