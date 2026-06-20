<script lang="ts">
    import { relUrl, nspidUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import { isAdmin } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { type Translations } from '$lib/translations';
    import { extractSPIDFromRawData, spName } from '$lib/helpers/ir';
    import { aA } from '$lib/helpers/stores';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingNSP } from '$lib/data';
    import db from '$lib/client/db';
    import { Eye, FilePen, Server, Trash2 } from "@lucide/svelte";

    const { t, lang, sp }: {
        t: Translations, sp: ExistingNSP, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const nspid = $derived(extractSPIDFromRawData(sp.NSP.zasah));
</script>

<PDFLink
    data={sp} dropdownItems={[{
        variant: 'primary',
        icon: Eye,
        text: td.viewFilledData,
        href: relUrl(`/NSP?view-nspid=${nspid}`),
    }, {
        variant: 'warning',
        icon: FilePen,
        text: td.editProtocol,
        href: relUrl(`/NSP?edit-nspid=${nspid}`),
    }, {
        variant: 'danger',
        icon: Trash2,
        text: td.deleteProtocol + $aA,
        onSelect: () => {
            db.deleteNSP(nspid);
            goto(nspidUrl(`/detail?deleted`), { replaceState: true });
        },
        hide: !$isAdmin,
    }, {
        variant: 'primary',
        icon: Server,
        text: td.openInDatabase + $aA,
        onSelect: () => { window.open(`https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fsp~2F${nspid}`) },
        hide: !$isAdmin,
    }]} {lang} link="NSP" name={spName(sp.NSP.zasah)} {nspid} {t}>
</PDFLink>