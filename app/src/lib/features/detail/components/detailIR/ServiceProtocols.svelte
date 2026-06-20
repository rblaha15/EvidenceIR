<script lang="ts">
    import { type IRID, type SPID, spName, szName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingIR } from '$lib/data';
    import { copySP, deleteSP } from '$lib/features/detail/actions/detailIR/sp';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';
    import { Button } from '$lib/components/ui/button';
    import { isRegulusOrAdmin } from '$lib/client/auth';
    import { Copy, Eye, FilePen, Plus, Trash2 } from "@lucide/svelte";
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
    } from "$lib/components/ui/alert-dialog";
    import { Spinner } from "$lib/components/ui/spinner";
    import { ButtonGroup } from "$lib/components/ui/button-group";

    const {
        irid, ir, lang, t,
    }: {
        irid: IRID, ir: ExistingIR, lang: LanguageCode, t: Translations,
    } = $props();
    const td = $derived(t.detail);
    const r = $derived($isRegulusOrAdmin);
    const any = $derived(!!ir.SPs.keys().length);
    const sorted = $derived(ir.SPs.entries().sortedBy(([_, p]) => new Date(p.zasah.datum)));

    let openedDuplicateModal = $state<SPID>();
    let openedDeleteModal = $state<SPID>();
    const protocolToDuplicateID = $derived(openedDuplicateModal!);
    const protocolToDeleteID = $derived(openedDeleteModal!);
    const protocolToDelete = $derived(openedDeleteModal ? ir.SPs[openedDeleteModal] : undefined!);

    let processing = $state(false);
</script>

<h4 class="m-0">{r ? td.serviceProtocols : td.serviceInterventions}</h4>
{#if any}
    <div class="flex flex-col gap-1 sm:items-start">
        {#each sorted as [id, p]}
            {@const showSP = isSP(p) && r}
            {#if showSP}
                <PDFLink
                    name={spName(p.zasah)} data={ir} {t} {lang} link="SP" {id} {irid} dropdownItems={[{
                        variant: 'primary',
                        icon: Eye,
                        text: td.viewFilledData,
                        href: iridUrl(`/SP/?view=${id}`),
                    }, {
                        variant: 'warning',
                        icon: FilePen,
                        text: td.editProtocol,
                        href: iridUrl(`/SP/?edit=${id}`),
                    }, {
                        variant: 'primary',
                        icon: Trash2,
                        text: td.delete,
                        onSelect: () => openedDeleteModal = id,
                    }, {
                        variant: 'primary',
                        icon: Copy,
                        text: td.duplicate,
                        onSelect: () => openedDuplicateModal = id,
                    }]} signed={ir.signatures?.SP?.[id]?.state == 'signed'}
                />
            {:else}
                <ButtonGroup>
                    <Button href={iridUrl(`/SZ/?view=${id}`)} variant="outline">
                        <Eye />
                        {szName(p.zasah)}
                    </Button>
                    {#if !isSP(p)}
                        <SmallDropdown dropdownItems={[{
                            variant: 'warning',
                            icon: FilePen,
                            text: td.editIntervention,
                            href: iridUrl(`/SZ/?edit=${id}`),
                        }]} />
                    {/if}
                </ButtonGroup>
            {/if}
        {/each}
    </div>
{/if}

<div class="flex items-start">
    <Button href={iridUrl(r ? '/SP' : '/SZ')}>
        <Plus />
        {r ? any ? td.fillInAnotherProtocol : td.fillInProtocol
            : any ? td.fillInAnotherIntervention : td.fillInIntervention}
    </Button>
</div>

<AlertDialog onOpenChange={() => openedDuplicateModal = undefined} open={!!openedDuplicateModal}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>{td.duplicate}</AlertDialogTitle>
            <AlertDialogDescription>{td.copySP}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.no}
            </AlertDialogCancel>
            <AlertDialogAction disabled={processing} onclick={async () => {
                processing = true;
                await copySP(protocolToDuplicateID, ir);
                processing = false;
                openedDuplicateModal = undefined;
            }}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.yes}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>

<AlertDialog onOpenChange={() => openedDeleteModal = undefined} open={!!openedDeleteModal}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle class="flex gap-2">
                <Trash2 />
                {td.delete} {isSP(protocolToDelete) ? spName(protocolToDelete.zasah) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>{td.deleteSP}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel variant="primary" disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.no}
            </AlertDialogCancel>
            <AlertDialogAction variant="danger" disabled={processing} onclick={async () => {
                processing = true;
                await deleteSP(irid, protocolToDeleteID);
                processing = false;
                openedDeleteModal = undefined;
            }}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.yes}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>