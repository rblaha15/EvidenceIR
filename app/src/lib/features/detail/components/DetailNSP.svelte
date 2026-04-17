<script lang="ts">
    import { relUrl, spidUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { extractSPIDFromRawData, spName } from '$lib/helpers/ir';
    import { aA } from '$lib/helpers/stores';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingNSP } from '$lib/data';
    import db from '$lib/Database';
    import { Eye, FilePen, Server, Trash2 } from "@lucide/svelte";

    const { t, lang, sp }: {
        t: Translations, sp: ExistingNSP, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const spid = $derived(extractSPIDFromRawData(sp.NSP.zasah));
</script>

{#snippet deleteButton()}
    <button class="btn btn-danger" onclick={() => {
        db.deleteNSP(spid);
        goto(spidUrl(`/detail?deleted`), { replaceState: true });
    }}>
        <Trash2 />
        {td.deleteProtocol}{$aA}
    </button>
{/snippet}

<PDFLink
    data={sp} link="NSP" name={spName(sp.NSP.zasah)} {spid} {t} {lang} dropdownItems={[{
        color: 'primary',
        icon: Eye,
        text: td.viewFilledData,
        href: relUrl(`/NSP?view-spid=${spid}`),
    }, {
        color: 'warning',
        icon: FilePen,
        text: td.editProtocol,
        href: relUrl(`/NSP?edit-spid=${spid}`),
    }, {
        item: deleteButton,
        hide: !$isUserAdmin,
    }, {
        color: 'secondary',
        icon: Server,
        text: td.openInDatabase + $aA,
        href: `https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fsp~2F${spid}`,
        hide: !$isUserAdmin,
    }]}>
</PDFLink>