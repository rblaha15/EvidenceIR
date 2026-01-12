<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import { type IRID, supportsRemoteAccess } from '$lib/helpers/ir';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { aA, aR } from '$lib/helpers/stores';
    import PDFLink from './PDFLink.svelte';
    import { iridUrl } from '$lib/helpers/runes.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import { hasRKTL, isRKTL } from '$lib/forms/RKT/infoRKT';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);
</script>

{#if ir.evidence.vzdalenyPristup.chce}
    <PDFLink name={t.rr.name} {t} link="RR" data={ir} {irid} />
{/if}
{#if supportsRemoteAccess(ir.evidence.ir.typ.first)}
    <PDFLink name={t.nnr.title} {t} link="NNR" data={ir} {irid} />
{/if}
{#if ir.evidence.ir.typ.second === 'TRS6 K'}
    <PDFLink name={t.nnt.title} {t} link="NNT" data={ir} />
{/if}
{#if ir.evidence.ir.chceVyplnitK.includes('heatPump') && ir.evidence.tc.model !== 'airTHERM 10'}
    <PDFLink
        disabled={!ir.uvedeniTC?.uvadeni?.typZaruky} name={t.tc.name} {t} link="UPT"
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
    {#each cascadePumps(ir.evidence) as tc}
        <PDFLink name={t.zlt.name(tc)} {t} link="ZLT" data={ir} pump={tc.N} {irid} />
    {/each}
    {#each cascadePumps(ir.evidence) as tc}
        <PDFLink
            name={t.rkt.name(tc)} {t} link={hasRKTL(ir.kontrolyTC[tc.N]) ? 'RKTL' : 'RKT'} data={ir} pump={tc.N} {irid}
            disabled={!ir.kontrolyTC[tc.N]?.keys()?.length} additionalButton={{
                show: true,
                href: iridUrl(`/RKT?pump=${tc.N}`),
                text: t.rkt.fillOut(tc),
                important: ir.yearlyHeatPumpCheckRecommendation?.state === 'sentRequest',
            }} dropdownItems={$isUserAdmin ? ir.kontrolyTC[tc.N]?.entries().flatMap(([y, k]) => [{
                text: `${t.rkt.year} ${y}`,
            }, {
                color: 'warning',
                icon: 'edit_document',
                text: td.editCheck + $aA,
                href: iridUrl(`/${isRKTL(k) ? 'RKTL' : 'RKT'}?pump=${tc.N}&edit-year=${y}`),
            }]) : undefined}
        />
    {/each}
{/if}
{#if ir.evidence.ir.chceVyplnitK.includes('solarCollector')}
    <PDFLink
        disabled={!ir.uvedeniSOL} name={t.sol.name} {t}
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
    <PDFLink name={t.zls.name} {t} link="ZLS" data={ir} {irid} />
    <PDFLink
        name={t.rks.name} {t} link="RKS" data={ir} {irid}
        disabled={!ir.kontrolySOL?.keys()?.length} additionalButton={{
            show: true,
            href: iridUrl(`/RKS`),
            text: t.rks.fillOut,
            important: ir.yearlySolarSystemCheckRecommendation?.state === 'sentRequest',
        }} dropdownItems={$isUserAdmin ? ir.kontrolySOL?.keys().flatMap(y => [{
            text: `${t.rks.year} ${y}`,
        }, {
            color: 'warning',
            icon: 'edit_document',
            text: td.editCheck + $aA,
            href: iridUrl(`/RKS?edit-year=${y}`),
        }]) : undefined}
    />
{/if}
{#if ir.evidence.ir.chceVyplnitK.includes('photovoltaicPowerPlant')}
    <PDFLink
        disabled={!ir.uvedeniFVE}
        name={t.fve.name} {t} link="UPF" data={ir} {irid} additionalButton={{
            href: iridUrl('/UPF'),
            text: t.fve.commission,
            important: true,
        }}
    />
{/if}
{#if ir.evidence.ir.typ.first === 'IR 14'}
    <PDFLink
        name={t.ft.title} {t} link="FT" data={ir} {irid}
        disabled={!ir.faceTable} additionalButton={{
            href: iridUrl('/FT'),
            text: t.ft.setUp,
        }}
    />
{/if}