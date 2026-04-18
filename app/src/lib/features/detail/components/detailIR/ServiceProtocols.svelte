<script lang="ts">
    import { type IRID, spName, szName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingIR } from '$lib/data';
    import { copySP, deleteSP } from '$lib/features/detail/actions/detailIR/sp';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';
    import Button from '$lib/components/Button.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
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
    const r = $derived($isUserRegulusOrAdmin);

    let openedDuplicateModal = $state<number>();
    let openedDeleteModal = $state<number>();
    const protocolToDuplicateIndex = $derived(openedDuplicateModal!);
    const protocolToDeleteIndex = $derived(openedDeleteModal!);
    const protocolToDelete = $derived(openedDeleteModal ? ir.SPs[openedDeleteModal] : undefined!);

    let processing = $state(false);
</script>

<h4 class="m-0">{r ? td.serviceProtocols : td.serviceInterventions}</h4>
{#if ir.SPs.length}
    <div class="flex flex-col gap-1 sm:items-start">
        {#each ir.SPs as p, i}
            {@const showSP = isSP(p) && r}
            {#if showSP}
                <PDFLink
                    name={spName(p.zasah)} data={ir} {t} {lang} link="SP" index={i} {irid} dropdownItems={[{
                        variant: 'default',
                        icon: Eye,
                        text: td.viewFilledData,
                        href: iridUrl(`/SP/?view=${i}`),
                    }, {
                        variant: 'warning',
                        icon: FilePen,
                        text: td.editProtocol,
                        href: iridUrl(`/SP/?edit=${i}`),
                    }, {
                        variant: 'default',
                        icon: Trash2,
                        text: td.delete,
                        onSelect: () => openedDeleteModal = i,
                    }, {
                        variant: 'default',
                        icon: Copy,
                        text: td.duplicate,
                        onSelect: () => openedDuplicateModal = i,
                    }]}
                />
            {:else}
                <div class="flex flex-row gap-4 items-center">
                    <Button text={szName(p.zasah)} href={iridUrl(`/SZ/?view=${i}`)} variant="link" icon={Eye} />
                    {#if !isSP(p)}
                        <SmallDropdown dropdownItems={[{
                            variant: 'warning',
                            icon: FilePen,
                            text: td.editIntervention,
                            href: iridUrl(`/SZ/?edit=${i}`),
                        }]} />
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
{/if}

<div class="flex items-center gap-4 flex-wrap sm:flex-nowrap">
    <a class="btn btn-primary" href={iridUrl(r ? '/SP' : '/SZ')} tabindex="0">
        <Plus />
        {r ? ir.SPs.length ? td.fillInAnotherProtocol : td.fillInProtocol
            : ir.SPs.length ? td.fillInAnotherIntervention : td.fillInIntervention}
    </a>
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
                await copySP(protocolToDuplicateIndex, ir);
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
            <AlertDialogCancel variant="default" disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.no}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={processing} onclick={async () => {
                processing = true;
                await deleteSP(irid, protocolToDeleteIndex);
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