<script lang="ts">
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import type { ExistingIR } from '$lib/data';
    import { type IRID, isSP, isSZ, type SPID, spName, szName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { copySP, deleteSP } from '$lib/features/detail/actions/detailIR/sp';
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
            {#if isSP(p) || isSZ(p)}
                {@const form = isSP(p) ? 'SP' : 'SZ'}
                {@const name = isSP(p) ? spName(p.zasah) : szName(p.zasah)}
                <PDFLink
                    {name} data={ir} {t} {lang} link="SP" {id} {irid} dropdownItems={[{
                        variant: 'default',
                        icon: Eye,
                        text: td.viewFilledData,
                        href: iridUrl(`/${form}/?view=${id}`),
                    }, {
                        variant: 'warning',
                        icon: FilePen,
                        text: isSP(p) ? td.editProtocol : td.editIntervention,
                        href: iridUrl(`/${form}/?edit=${id}`),
                    }, {
                        variant: 'default',
                        icon: Trash2,
                        text: td.delete,
                        hide: !r,
                        onSelect: () => openedDeleteModal = id,
                    }, {
                        variant: 'default',
                        icon: Copy,
                        text: td.duplicate,
                        hide: !isSP(p),
                        onSelect: () => openedDuplicateModal = id,
                    }]} signed={ir.signatures?.SP?.[id]?.state == 'signed'}
                />
            {:else}
                <ButtonGroup>
                    <Button href={iridUrl(`/SZ/?view=${id}`)} variant="outline">
                        <Eye />
                        {szName(p.zasah)}
                    </Button>
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