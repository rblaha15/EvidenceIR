<script lang="ts">
    import { page } from '$app/state';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { getForm } from '$lib/forms/forms';
    import type { IRID, SPID } from '$lib/helpers/ir';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { Component } from "svelte";
    import { FilePlusCorner, HousePlus, Info, type LucideProps, Search } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button";

    const {
        t, onclick,
    }: {
        t: Translations,
        onclick?: () => void,
    } = $props();
    const tn = $derived(t.nav);
    type BooleanLike = unknown
    type s = string

    const route = $derived(page.route.id);
    const isForm = $derived(route?.endsWith('[form=form]') ?? false);
    const isPdf = $derived(route?.endsWith('[pdf=pdf]') ?? false);
    const form = $derived(page.params.form);
    const search = $derived(page.url.searchParams);
    const formType = $derived(getForm(form!)?.type);
    const isDetailPage = $derived(isForm && formType === 'IR' || route?.endsWith('/detail') || route?.endsWith('/users') || isPdf);
    const externalIRID = $derived(search.get('view-irid') || search.get('edit-irid')) as IRID | undefined;
    const externalSPID = $derived(search.get('view-spid') || search.get('edit-spid')) as SPID | undefined;
    const spids = $derived(page.data.spids as SPID[] | null);
</script>

{#snippet item(
    {
        url, label, selected, shown = true, Icon
    }: {
        url: s, label: s, selected: BooleanLike, shown?: BooleanLike, Icon: Component<LucideProps>,
    },
)}
    {#if shown}
        <li class="text-nowrap">
            <Button variant={selected ? 'secondary' : 'ghost'} href={url} {onclick}>
                <Icon />
                {label}
            </Button>
        </li>
    {/if}
{/snippet}

{@render item({
    url: relUrl('/search'), label: t.nav.search, selected: route?.endsWith('/search'), Icon: Search,
})}
{@render item({
    url: relUrl('/IN'), label: tn.newRegistration, Icon: HousePlus,
    selected: isForm && form === 'IN' && !externalIRID,
})}
{@render item({
    url: relUrl('/NSP'), label: tn.independentServiceProtocol/* + $aR*/, shown: $isUserRegulusOrAdmin, Icon: FilePlusCorner,
    selected: isForm && form === 'NSP' && !externalSPID,
})}
{@render item({
    url: isDetailPage
        ? spids?.length ? detailSpUrl() : detailIrUrl()
        : externalSPID ? detailSpUrl([externalSPID]) : detailIrUrl(externalIRID),
    label: (spids?.length || externalSPID) ? tn.protocolDetails : tn.installationDetails,
    selected: true, shown: isDetailPage || externalIRID || externalSPID, Icon: Info,
})}
