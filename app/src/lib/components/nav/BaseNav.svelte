<script lang="ts">
    import { page } from '$app/state';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { getForm } from '$lib/forms/forms';
    import type { IRID, SPID } from '$lib/helpers/ir';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { invalidateAll } from '$app/navigation';
    import { aA, aR } from '$lib/helpers/stores';
    import Icon from '$lib/components/Icon.svelte';

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
    const spids = $derived(page.data.spids as SPID[] | null);
</script>

{#snippet item({ url, label, selected, shown = true, icon, noPadding }: { url: s, label: s, selected: BooleanLike, shown?: BooleanLike, icon: s, noPadding?: BooleanLike })}
    {#if shown}
        <li class="link-item text-nowrap" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link"
                class:active={selected}
                aria-current={selected ? 'page' : null}
                href={url}
            >
                <Icon {icon} />
                {label}
            </a>
        </li>
    {/if}
{/snippet}

<ul class="navbar-nav">
    {@render item({
        url: relUrl('/search'), label: t.nav.search, selected: route?.endsWith('/search'), icon: 'search', noPadding: true,
    })}
    {@render item({
        url: relUrl('/IN'), label: tn.newRegistration, icon: 'add_home_work',
        selected: isForm && form === 'IN' && !externalIRID,
    })}
    {@render item({
        url: relUrl('/NSP'), label: tn.independentServiceProtocol/* + $aR*/, shown: $isUserRegulusOrAdmin, icon: 'format_list_bulleted_add',
        selected: isForm && form === 'NSP' && !externalSPID,
    })}
    {@render item({
        url: isDetailPage
            ? spids?.length ? detailSpUrl() : detailIrUrl()
                : externalSPID ? detailSpUrl([externalSPID]) : detailIrUrl(externalIRID),
        label: (spids?.length || externalSPID) ? tn.protocolDetails : tn.installationDetails,
        selected: true, shown: isDetailPage || externalIRID || externalSPID, icon: 'info',
    })}
</ul>
