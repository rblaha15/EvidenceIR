<script lang="ts">
    import { relUrl, spidUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { extractSPIDFromRawData, spName } from '$lib/helpers/ir';
    import { aA } from '$lib/helpers/stores';
    import Icon from '$lib/components/Icon.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingNSP } from '$lib/data';
    import db from '$lib/Database';

    const { t, lang, sp }: {
        t: Translations, sp: ExistingNSP, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const spid = $derived(extractSPIDFromRawData(sp.NSP.zasah));
</script>

{#snippet deleteButton()}
    <button class="btn btn-danger" onclick={() => {
        db.deleteIndependentProtocol(spid);
        goto(spidUrl(`/detail?deleted`), { replaceState: true });
    }}>
        <Icon icon="delete_forever" />
        {td.deleteProtocol}{$aA}
    </button>
{/snippet}

<PDFLink
    data={sp} link="NSP" name={spName(sp.NSP.zasah)} {spid} {t} {lang} dropdownItems={[{
        color: 'primary',
        icon: 'preview',
        text: td.viewFilledData,
        href: relUrl(`/NSP?view-spid=${spid}`),
    }, {
        color: 'warning',
        icon: 'edit_document',
        text: td.editProtocol,
        href: relUrl(`/NSP?edit-spid=${spid}`),
    }, {
        item: deleteButton,
        hide: !$isUserAdmin,
    }, {
        color: 'secondary',
        icon: 'cloud_circle',
        text: td.openInDatabase + $aA,
        href: `https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fsp~2F${spid}`,
        hide: !$isUserAdmin,
    }]}>
</PDFLink>