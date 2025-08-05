<script lang="ts">
    import { type IRID, spName } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/client/data';
    import type { LanguageCode } from '$lib/languages';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { techniciansList } from '$lib/client/realtime';
    import { currentUser } from '$lib/client/auth';
    import { invalidateAll } from '$app/navigation';

    const {
        irid, ir, lang, t,
    }: {
        irid: IRID, ir: IR, lang: LanguageCode, t: Translations,
    } = $props();
    const td = $derived(t.detail);

    const copySP = (i: number) => async () => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        const p = ir.installationProtocols[i];
        await db.addServiceProtocol(irid!, {
            ...p,
            fakturace: {
                hotove: 'doNotInvoice',
                komu: null,
                jak: null,
            },
            zasah: {
                ...p.zasah,
                clovek: ja?.name ?? p.zasah.clovek,
                inicialy: ja?.initials ?? p.zasah.inicialy,
            },
        });
        await invalidateAll();
    };
</script>

<h4 class="m-0">{td.serviceProtocols}</h4>
{#if ir.installationProtocols.length}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#each ir.installationProtocols as p, i}
            <PDFLink name={spName(p.zasah)} {lang} data={ir} {t} link="SP" index={i}
                     hideLanguageSelector={true}
                     breakpoint="md" {irid}>
                {#snippet dropdown()}
                    <li><a class="dropdown-item text-primary" href={iridUrl(`/SP/?view=${i}`)}>{td.viewFilledData}</a></li>
                    <li><a class="dropdown-item text-warning" href={iridUrl(`/SP/?edit=${i}`)}>{td.editProtocol}</a></li>
                    <li><button class="dropdown-item text-warning" data-bs-toggle="modal" data-bs-target="#duplicateModal">{td.duplicate}</button></li>
                {/snippet}
            </PDFLink>

            <div class="modal fade" id="duplicateModal" tabindex="-1" aria-labelledby="duplicateModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="duplicateModalLabel">{td.duplicate}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.copySP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(i)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<div class="d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
    <a class="btn btn-primary" href={iridUrl('/SP')} tabindex="0">
        {ir.installationProtocols.length ? td.fillInAnotherProtocol : td.fillInProtocol}
    </a>
</div>