<script lang="ts">
    import { detailIrUrl, detailSpUrl, relUrl, spidUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { storable } from '$lib/helpers/stores';
    import NSP from '$lib/forms/IN/infoIN';
    import { isUserAdmin } from '$lib/client/auth';
    import Widget from '$lib/components/Widget.svelte';
    import db from '$lib/client/data';
    import { goto } from '$app/navigation';
    import type { LanguageCode } from '$lib/languages';
    import { p, type Translations } from '$lib/translations';
    import type { FormNSP } from '$lib/forms/NSP/formNSP';
    import type { Raw } from '$lib/forms/Form';
    import type { IRID, SPID } from '$lib/helpers/ir';
    import { InputWidget } from '$lib/forms/Widget.svelte';

    const {
        t, sp, spid, lang,
    }: {
        t: Translations, sp: Raw<FormNSP>, spid: SPID, lang: LanguageCode,
    } = $props()

    const newIRID = new InputWidget({
        label: p('IRID (z URL adresy)'),
    });
    const transfer = async () => {
        if (!sp) return;
        await db.addServiceProtocol(newIRID.value as IRID, {
            zasah: sp.zasah, fakturace: sp.fakturace, ukony: sp.ukony, nahradniDil1: sp.nahradniDil1,
            nahradniDil2: sp.nahradniDil2, nahradniDil3: sp.nahradniDil3, nahradniDil4: sp.nahradniDil4,
            nahradniDil5: sp.nahradniDil5, nahradniDil6: sp.nahradniDil6, nahradniDil7: sp.nahradniDil7,
            nahradniDil8: sp.nahradniDil8, nahradniDily: sp.nahradniDily,
        });
        await goto(detailIrUrl(newIRID.value as IRID), { replaceState: true });
    };
</script>

<div class="d-flex flex-column gap-1 align-items-sm-start">
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/OD?redirect=${detailSpUrl()}&user=${sp.koncovyUzivatel.email}`)}>
            {t.sendDocuments}
        </a>

        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/NSP?view-spid=${spid}`)}>
            {t.viewInfo}
        </a>

        <PDFLink {lang} {t} link="NSP" hideLanguageSelector={true} data={sp} {spid} />

        <a class="btn btn-warning" href={relUrl('/NSP')} onclick={() => {
            storable<typeof sp>(NSP.storeName).set(sp)
        }}>Vytvořit kopii protokolu</a>
    </div>

    {#if $isUserAdmin}
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