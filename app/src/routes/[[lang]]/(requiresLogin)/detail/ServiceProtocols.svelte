<script lang="ts">
    import { type IRID, spName } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/client/data';
    import type { LanguageCode } from '$lib/languages';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { techniciansList } from '$lib/client/realtime';
    import { currentUser } from '$lib/client/auth';

    const {
        irid, values, lang, t,
    }: {
        irid: IRID,
        values: IR,
        lang: LanguageCode,
        t: Translations,
    } = $props();

    const copySP = (i: number) => async () => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        const p = values.installationProtocols[i];
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
        location.reload();
    };
</script>

<h4 class="m-0">Protokoly servisního zásahu</h4>
{#if values.installationProtocols.length}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#each values.installationProtocols as p, i}
            <PDFLink name={spName(p.zasah)} {lang} data={values} {t} link="SP" index={i}
                     hideLanguageSelector={true}
                     breakpoint="md">
                {#snippet dropdown()}
                    <li><a class="dropdown-item text-primary" href={iridUrl(`/SP/?view=${i}`)}>{t.viewInfo}</a></li>
                    <li><a class="dropdown-item text-warning" href={iridUrl(`/SP/?edit=${i}`)}>Upravit protokol</a></li>
                    <li><button class="dropdown-item text-warning" data-bs-toggle="modal" data-bs-target="#duplicateModal">Duplikovat</button></li>
                {/snippet}
            </PDFLink>

            <div class="modal fade" id="duplicateModal" tabindex="-1" aria-labelledby="duplicateModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="duplicateModalLabel">Duplikovat</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Chcete vytvořit kopii pro vykázání servisního zásahu více osob?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Ne</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(i)}>Ano</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<div class="d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
    <a class="btn btn-primary" href={iridUrl('/SP')} tabindex="0">
        Vyplnit {values.installationProtocols.length ? 'další ' : ''} protokol
    </a>
</div>