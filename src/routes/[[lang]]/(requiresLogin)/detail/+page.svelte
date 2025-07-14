<script lang="ts">
    import { untrack } from 'svelte';
    import type { PageProps } from './$types';
    import PDFLink from './PDFLink.svelte';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { extractIRIDFromParts, type IRID, irNumberFromIRID, irWholeName, spWholeName } from '$lib/helpers/ir';
    import { ChooserWidget, InputWidget } from '$lib/forms/Widget.svelte.js';
    import { detailIrUrl, iridUrl, relUrl, spidUrl } from '$lib/helpers/runes.svelte.js';
    import Widget from '$lib/components/Widget.svelte';
    import { time, todayISO } from '$lib/helpers/date';
    import NSP from '$lib/forms/NSP/infoNSP';
    import { type P, p } from '$lib/translations';
    import db from '$lib/client/data';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import type { IRTypes } from '$lib/forms/IN/formIN';
    import { goto } from '$app/navigation';

    let { data }: PageProps = $props();
    const { irid, spid, ir, sp, success, languageCode: lang, translations: t } = $derived(data)

    const deleted = $derived(page.url.searchParams.has('deleted'));

    const remove = async () => {
        await db.deleteIR(irid!);
        await goto(iridUrl(`/detail?deleted`), { replaceState: true });
    };

    let change: 'no' | 'input' | 'sending' | 'fail' | 'unchanged' = $state('no');

    type D = { type: ChooserWidget<D, P<IRTypes>>, number: InputWidget<D> };

    const sorel = (d: D) => d.type.value == p('SOREL');

    let irType = $state(new ChooserWidget<D, P<IRTypes>>({
        label: `controllerType`,
        options: p(['IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL']),
        onValueSet: (d, v) => {
            if (v == p('SOREL')) {
                d.number.setValue(d, `${todayISO()} ${time()}`);
            }
        },
    }));
    let irNumber = $state(new InputWidget<D>({
        label: `serialNumber`,
        onError: `wrongNumberFormat`,
        regex: d => sorel(d)
            ? /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/
            : d.type.value == p('IR 12')
                ? /[A-Z][1-9OND] [0-9]{4}|00:0A:0[69]:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}/
                : /[A-Z][1-9OND] [0-9]{4}/,
        capitalize: true,
        maskOptions: d => ({
            mask: sorel(d) ? `0000-00-00T00:00` :
                d.type.value != p('IR 12') ? 'Z1 0000'
                    : d.number.value.length == 0 ? 'X'
                        : d.number.value[0] == '0'
                            ? 'NN:NA:N6:FF:FF:FF'
                            : 'Z1 0000',
            definitions: {
                X: /[0A-Za-z]/,
                N: /0/,
                A: /[Aa]/,
                6: /[69]/,
                F: /[0-9A-Fa-f]/,
                Z: /[A-Za-z]/,
                1: /[1-9ONDond]/,
            },
        }),
        show: d => !sorel(d),
    }));

    const d = $derived({ number: irNumber, type: irType });

    $effect(() => {
        if (!ir) return;
        untrack(() => {
            irNumber.setValue(d, ir.evidence.ir.cislo);
            irType.setValue(d, ir.evidence.ir.typ.first);
        });
    });

    const changeController = async () => {
        try {
            irNumber.displayErrorVeto = true;
            irType.displayErrorVeto = true;
            if (irNumber.showError(d) || irType.showError(d)) return;
            const newNumber = irNumber.value;
            const newType = irType.value;
            change = 'sending';
            const record = (await db.getIR(irid!))!;
            record.evidence.ir.cislo = newNumber;
            if (record.evidence.ir.cislo == newNumber) return change = 'unchanged';
            record.evidence.ir.typ.first = newType;
            await db.addIR(record);
            const newRecord = await db.getIR(extractIRIDFromParts(newType!, newNumber));
            if (!newRecord?.evidence) return change = 'fail';
            await db.deleteIR(irid!);
            await goto(detailIrUrl(extractIRIDFromParts(newType!, newNumber)), { replaceState: true });
        } catch (e) {
            console.log(e);
            change = 'fail';
        }
    };

    $effect(() => setTitle(spid ? 'Instalační a servisní protokol' : t.evidenceDetails, true));

    const newIRID = new InputWidget({
        label: p('IRID (z URL adresy)'),
    });
    const transfer = async () => {
        if (!sp) return
        await db.addServiceProtocol(newIRID.value as IRID, {
            zasah: sp.zasah, fakturace: sp.fakturace, ukony: sp.ukony, nahradniDil1: sp.nahradniDil1,
            nahradniDil2: sp.nahradniDil2, nahradniDil3: sp.nahradniDil3, nahradniDil4: sp.nahradniDil4,
            nahradniDil5: sp.nahradniDil5, nahradniDil6: sp.nahradniDil6, nahradniDil7: sp.nahradniDil7,
            nahradniDil8: sp.nahradniDil8, nahradniDily: sp.nahradniDily,
        });
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };
</script>

{#if success}
    <h3 class="m-0">{sp ? spWholeName(sp) : ir ? irWholeName(ir.evidence) : ''}</h3>
{:else}
    <h3 class="m-0">
        {#if !irid}
            {spid?.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
        {:else}
            {irNumberFromIRID(irid)}
        {/if}
    </h3>
{/if}
{#if deleted}
    <div class="alert alert-success" role="alert">
        {t.successfullyDeleted}
    </div>
{/if}
{#if !success}
    <div>{t.sorrySomethingWentWrong}</div>
    <div>
        {#if irid}
            {t.linkInvalid}
        {:else if spid}
            Buď protokol neexistuje nebo k němu nemáte přístup.
        {/if}
    </div>
{/if}
{#if success && spid && sp}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${sp.koncovyUzivatel.email}`)}>
            {t.sendDocuments}
        </a>

        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/NSP?view-spid=${spid}`)}>
            {t.viewInfo}
        </a>

        <PDFLink {lang} {t} link="NSP" hideLanguageSelector={true} data={sp} />

        <a class="btn btn-warning" href={relUrl('/NSP')} onclick={() => {
            storable<typeof sp>(NSP.storeName).set(sp)
        }}>Vytvořit kopii protokolu</a>
    </div>

    {#if $isUserAdmin}
        <!--        <hr />-->
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            <Widget widget={newIRID} {t} data={{}} />
            <button class="btn btn-danger d-block" onclick={transfer}>Převést protokol k IR (neodstraní se)</button>

            <button class="btn btn-danger d-block" onclick={() => {
                db.deleteIndependentProtocol(spid);
                goto(spidUrl(`/detail?deleted`), { replaceState: true });
            }}
            >Odstranit protokol
            </button>
        </div>
    {/if}
{/if}
{#if success && irid && ir}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${ir.evidence.koncovyUzivatel.email}`)}>
            {t.sendDocuments}
        </a>
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/IN?view-irid=${irid}`)}>
            {t.viewInfo}
        </a>
    </div>
    <div class="d-flex flex-column gap-1">
        {#if ir.evidence.vzdalenyPristup.chce}
            <PDFLink name={t.regulusRouteForm} {t} link="RR" {lang} data={ir} />
        {/if}
        {#if ir.evidence.ir.typ.first !== p('SOREL')}
            <PDFLink name={t.routeGuide} {t} link="NN" {lang} data={ir} />
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('heatPump')}
            {#each cascadePumps(ir.evidence, t) as tc}
                <PDFLink name={t.warrantyNr(tc)} {t} link="ZL" {lang} data={ir} pump={tc.N} />
            {/each}
            <PDFLink
                enabled={ir.uvedeniTC !== undefined} name={t.heatPumpCommissionProtocol} {t} link="UPT"
                {lang} data={ir}
            >
                {#if !ir.uvedeniTC}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPT')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
            {#each cascadePumps(ir.evidence, t) as tc}
                <PDFLink name={t.filledYearlyCheckNr(tc)} {t} link="RK" {lang} data={ir} pump={tc.N}
                         enabled={ir.kontrolyTC[tc.N]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={iridUrl(`/RK?tc=${tc.N}`)}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheckNr(tc)}</a>
                </PDFLink>
            {/each}
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('solarCollector')}
            <PDFLink
                enabled={ir.uvedeniSOL !== undefined}
                name={t.solarCollectorCommissionProtocol}
                {t}
                link="UPS"
                {lang} data={ir}
            >
                {#if !ir.uvedeniSOL}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPS')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('photovoltaicPowerPlant')}
            <PDFLink
                enabled={ir.uvedeniFVE !== undefined}
                name={t.photovoltaicSystemCommissionProtocol}
                {t}
                link="UPF"
                {lang} data={ir}
            >
                {#if !ir.uvedeniFVE}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPF')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
        {/if}
    </div>
    {#if $isUserRegulusOrAdmin}
        <ServiceProtocols {ir} {t} {lang} {irid} />
    {/if}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#if $isUserRegulusOrAdmin}
            <a tabindex="0" class="btn btn-info" href={iridUrl('/users')}>
                Uživatelé s přístupem k této evidenci
            </a>
        {/if}
        {#if change === 'no'}
            <button class="btn btn-warning d-block" onclick={() => (change = 'input')}
            >{t.changeController}</button>
        {:else if change === 'input'}
            <div class="d-flex flex-column gap-3 w-100">
                <Widget bind:widget={irType} data={d} {t} />
                <Widget bind:widget={irNumber} data={d} {t} />
                <div class="d-flex gap-3">
                    <button class="btn btn-danger" onclick={changeController}>{t.confirm}</button>
                    <button class="btn btn-secondary" onclick={() => (change = 'no')}>{t.cancel}</button>
                </div>
            </div>
        {:else if change === 'sending'}
            <div class="d-flex align-items-center">
                <span>{t.saving}...</span>
                <div class="spinner-border text-danger"></div>
            </div>
        {:else if change === 'unchanged'}
            <p class="text-danger">{t.changeWentWrong}</p>
        {:else if change === 'fail'}
            <p class="text-danger">{t.changeWentWrong}</p>
        {/if}
        <a class="btn btn-warning" tabindex="0"
           href={relUrl(`/IN?edit-irid=${irid}`)}>
            {t.editRegistration}
        </a>
        <button class="btn btn-danger d-block"
                data-bs-toggle="modal" data-bs-target="#deleteModal"
        >{t.deleteThisEvidence}</button>

        <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="deleteModalLabel">Odstranit</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Opravdu chcete odstranit evidenci instalace?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Zrušit</button>
                        <button type="button" class="btn btn-danger" onclick={remove}>Odstranit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}