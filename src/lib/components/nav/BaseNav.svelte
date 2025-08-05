<script lang="ts">
    import { page } from '$app/state';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { getForm } from '$lib/forms/forms.js';
    import type { IRID, SPID } from '$lib/helpers/ir';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';

    const { t }: { t: Translations } = $props();
    const tn = $derived(t.nav);
    type BooleanLike = unknown
    type s = string

    const route = $derived(page.route.id);
    const isForm = $derived(route?.endsWith('[form]') ?? false);
    const isPdf = $derived(route?.endsWith('[pdf]') ?? false);
    const form = $derived(page.params.form);
    const search = $derived(page.url.searchParams);
    const formType = $derived(getForm(form)?.type);
    const isDetailPage = $derived(isForm && formType === 'IR' || route?.endsWith('/detail') || route?.endsWith('/users') || isPdf);
    const externalIRID = $derived(search.get('view-irid') || search.get('edit-irid')) as IRID | undefined;
    const externalSPID = $derived(search.get('view-spid') || search.get('edit-spid')) as SPID | undefined;
</script>

{#snippet item({ url, label, selected, shown = true }: { url: s, label: s, selected: BooleanLike, shown?: BooleanLike })}
    {#if shown}
        <li class="link-item" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link ms-md-3"
                class:active={selected}
                aria-current={selected ? 'page' : null}
                href={url}
            >{label}</a>
        </li>
    {/if}
{/snippet}

<ul class="navbar-nav">
    {@render item({
        url: relUrl('/IN'), label: tn.newRegistration,
        selected: isForm && form === 'IN' && !externalIRID,
    })}
    {@render item({
        url: relUrl('/NSP'), label: tn.independentServiceProtocol, shown: $isUserRegulusOrAdmin,
        selected: isForm && form === 'NSP' && !externalSPID,
    })}
    {@render item({
        url: relUrl('/search'), label: t.nav.search, selected: route?.endsWith('/search'),
    })}
    {@render item({
        url: isDetailPage
            ? page.data.spid ? detailSpUrl() : detailIrUrl()
            : externalSPID ? detailSpUrl(externalSPID) : detailIrUrl(externalIRID),
        label: (page.data.spid || externalSPID) ? tn.protocolDetails : tn.installationDetails,
        selected: true, shown: isDetailPage || externalIRID || externalSPID,
    })}
    {@render item({
        url: relUrl('/admin'), label: 'Admin', shown: $isUserAdmin, selected: page.route.id?.endsWith('/admin'),
    })}
</ul>
