<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type ExistingIR } from '$lib/data';
    import { type IRID, irName, supportsRemoteAccess } from '$lib/helpers/ir';
    import { currentUser, isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { aA, aR } from '$lib/helpers/stores';
    import PDFLink from './PDFLink.svelte';
    import { detailIrUrl, iridUrl } from '$lib/helpers/runes.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import { hasRKTL, isRKTL } from '$lib/forms/RKT/infoRKT';
    import type { LanguageCode } from '$lib/languageCodes';
    import { blahova, defaultAddresses, sendEmail } from '$lib/client/email';
    import MailProtocol from '$lib/emails/MailProtocol.svelte';
    import { page } from '$app/state';
    import type { TC } from '$lib/forms/IN/defaultIN';
    import { goto } from '$app/navigation';
    import db from '$lib/Database';

    const { t, ir, irid, lang }: {
        t: Translations, ir: ExistingIR, irid: IRID, lang: LanguageCode
    } = $props();
    const td = $derived(t.detail);

    const confirmRefsite = (tc: TC, send: boolean = false) => async () => {
        const response = send ? await sendEmail({
            ...defaultAddresses(blahova),
            subject: `Vytvořit refsite u ${irName(ir.IN.ir)}`,
            component: MailProtocol,
            props: { name: $currentUser!.displayName || $currentUser!.email!, url: page.url.origin + detailIrUrl(irid), e: ir.IN },
        }) : undefined;
        if (response?.ok) await db.markRefsiteConfirmed(irid);
        await goto(iridUrl(`/RKT?pump=${tc}`));
    };
</script>

{#if ir.IN.vzdalenyPristup.chce}
    <PDFLink name={t.rr.name} {t} {lang} link="RR" data={ir} {irid} />
{/if}
{#if supportsRemoteAccess(ir.IN.ir.typ.first)}
    <PDFLink name={t.nnr.title} {t} {lang} link="NNR" data={ir} {irid} />
{/if}
{#if ir.IN.ir.typ.second === 'TRS6 K'}
    <PDFLink name={t.nnt.title} {t} {lang} link="NNT" data={ir} />
{/if}
{#if ir.IN.ir.chceVyplnitK.includes('heatPump') && ir.IN.tc.model !== 'airTHERM 10'}
    <PDFLink
        disabled={!ir.UP.TC?.uvadeni?.typZaruky} name={t.tc.name} {t} {lang} link="UPT"
        data={ir} {irid} additionalButton={{
            href: iridUrl('/UPT'),
            text: t.tc.commission,
            important: true,
        }} dropdownItems={$isUserRegulusOrAdmin ? [{
            color: 'warning',
            icon: 'edit_document',
            text: td.editProtocol + $aR,
            href: iridUrl(`/UPT/?edit`),
        }] : undefined}
    />
    {#each cascadePumps(ir.IN) as tc}
        <PDFLink name={t.zlt.name(tc)} {t} {lang} link="ZLT" data={ir} pump={tc.N} {irid} />
    {/each}
    {#each cascadePumps(ir.IN) as tc}
        <PDFLink
            name={t.rkt.name(tc)} {t} {lang} link={hasRKTL(ir.RK.TC[tc.N]) ? 'RKTL' : 'RKT'} data={ir} pump={tc.N} {irid}
            disabled={!ir.RK.TC[tc.N]?.keys()?.length} additionalButton={{
                show: true,
                ...ir.meta.flags?.confirmedRefsite
                    ? { href: iridUrl(`/RKT?pump=${tc.N}`) }
                    : { dialogID: `refsiteModal-${tc.N}` },
                text: t.rkt.fillOut(tc),
                important: ir.RK.DK.TC?.state === 'sentRequest',
            }} dropdownItems={$isUserAdmin ? ir.RK.TC[tc.N]?.entries().flatMap(([y, k]) => [{
                text: `${t.rkt.year} ${y}`,
            }, {
                color: 'warning',
                icon: 'edit_document',
                text: td.editCheck + $aA,
                href: iridUrl(`/${isRKTL(k) ? 'RKTL' : 'RKT'}?pump=${tc.N}&edit-year=${y}`),
            }]) : undefined}
        />
        <div class="modal fade" id="refsiteModal-{tc.N}" tabindex="-1" aria-labelledby="refsiteModalLabel-{tc.N}" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="refsiteModalLabel-{tc.N}">{td.refsiteTitle}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        {@html td.refsiteHtml}
                    </div>
                    <div class="modal-footer">
                        <a class="btn btn-secondary" href={iridUrl(`/RKT?pump=${tc.N}`)} data-bs-dismiss="modal" onclick={confirmRefsite(tc.N)}>{td.no}</a>
                        <a class="btn btn-primary" href={iridUrl(`/RKT?pump=${tc.N}`)} data-bs-dismiss="modal" onclick={confirmRefsite(tc.N, true)}>{td.yes}</a>
                    </div>
                </div>
            </div>
        </div>
    {/each}
{/if}
{#if ir.IN.ir.chceVyplnitK.includes('solarCollector')}
    <PDFLink
        disabled={!ir.UP.SOL} name={t.sol.name} {t} {lang}
        link="UPS" data={ir} {irid} additionalButton={{
            href: iridUrl('/UPS'),
            text: t.sol.commission,
            important: true,
        }} dropdownItems={$isUserRegulusOrAdmin ? [{
            color: 'warning',
            icon: 'edit_document',
            text: td.editProtocol + $aR,
            href: iridUrl(`/UPS?edit`),
        }] : undefined}
    />
    <PDFLink name={t.zls.name} {t} {lang} link="ZLS" data={ir} {irid} />
    <PDFLink
        name={t.rks.name} {t} {lang} link="RKS" data={ir} {irid}
        disabled={!ir.RK.SOL?.keys()?.length} additionalButton={{
            show: true,
            href: iridUrl(`/RKS`),
            text: t.rks.fillOut,
            important: ir.RK.DK.SOL?.state === 'sentRequest',
        }} dropdownItems={$isUserAdmin ? ir.RK.SOL?.keys().flatMap(y => [{
            text: `${t.rks.year} ${y}`,
        }, {
            color: 'warning',
            icon: 'edit_document',
            text: td.editCheck + $aA,
            href: iridUrl(`/RKS?edit-year=${y}`),
        }]) : undefined}
    />
{/if}
{#if ir.IN.ir.chceVyplnitK.includes('photovoltaicPowerPlant')}
    <PDFLink
        disabled={!ir.UP.FVE}
        name={t.fve.name} {t} {lang} link="UPF" data={ir} {irid} additionalButton={{
            href: iridUrl('/UPF'),
            text: t.fve.commission,
            important: true,
        }}
    />
{/if}
{#if ir.IN.ir.typ.first === 'IR 14'}
    <PDFLink
        name={t.ft.title} {t} {lang} link="FT" data={ir} {irid}
        disabled={!ir.FT} additionalButton={{
            href: iridUrl('/FT'),
            text: t.ft.setUp,
        }}
    />
{/if}