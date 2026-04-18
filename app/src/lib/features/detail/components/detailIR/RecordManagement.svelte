<script lang="ts">
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { type Translations } from '$lib/translations';
    import { aR, iaA } from '$lib/helpers/stores';
    import DK from './DK.svelte';
    import type { ExistingIR } from '$lib/data';
    import { downloadXML } from '$lib/features/detail/actions/detailIR/ir';
    import DeleteIR from '$lib/features/detail/components/detailIR/DeleteIR.svelte';
    import Button from '$lib/components/Button.svelte';
    import { unknownCompanyEmail } from '$lib/forms/IN/formIN';
    import { Download, Eye, FilePen, MailOpen, Server, Users } from "@lucide/svelte";

    const { t, ir, irid }: {
        t: Translations, ir: ExistingIR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);
    const mf = $derived(ir.IN.montazka.email == unknownCompanyEmail ? '' : ir.IN.montazka.email.trim())
</script>

<div class="flex flex-col gap-1 sm:items-start">
    {#if !ir.isDraft}
        <Button icon={MailOpen} text={td.sendDocuments}
                href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${endUserEmails(ir.IN.koncovyUzivatel).join(';')}&assembly=${mf}`)} />
    {/if}
    {#if ir.isDraft}
        <Button icon={FilePen} text={td.editInstallationData}
                href={relUrl(`/IN?edit-irid=${irid}`)} />
    {/if}
    <Button href={relUrl(`/IN?view-irid=${irid}`)} icon={Eye}
            text={td.viewFilledData} />
    {#if $isUserAdmin}
        <Button variant="secondary" icon={Server} text="{td.openInDatabase}{iaA}"
                href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{irid}"
                target="_blank" />
    {/if}
</div>
<div class="flex flex-col gap-1 sm:items-start">
    {#if $isUserRegulusOrAdmin}
        <Button variant="outline" icon={Users} text="{td.usersWithAccess}{$aR}"
                href={iridUrl('/users')} />
    {/if}
    {#if !ir.isDraft}
        <Button variant="warning" icon={FilePen} text={td.editInstallationData}
                href={relUrl(`/IN?edit-irid=${irid}`)} />
    {/if}
    <DeleteIR {irid} {td} />

    {#if $isUserRegulusOrAdmin && !ir.isDraft}
        <Button variant="secondary" icon={Download} text="{td.downloadXML}{$aR}"
                onclick={downloadXML(ir)} />
    {/if}
</div>

{#if !ir.isDraft}
    <DK {ir} {irid} {t} type="TČ" />
    <DK {ir} {irid} {t} type="SOL" />
{/if}