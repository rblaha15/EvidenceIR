<script lang="ts">
    import { page } from '$app/state';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import { detailIrUrl, detailSpUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { getForm } from '$lib/forms/forms.svelte';

    const { t }: { t: Translations } = $props();
    type BooleanLike = boolean | null | undefined
    type s = string

    const route = $derived(page.route.id)
    const isForm = $derived(route?.endsWith('[form]') ?? false)
    const form = $derived(page.params.form)
    const search = $derived(page.url.searchParams)
    const formType = $derived(getForm(form)?.type)
    const isDetailPage = $derived(isForm && formType === 'IR' || route?.endsWith('/detail') || route?.endsWith('/users'))
</script>

{#snippet item({url, label, selected, shown = true}: {url: s, label: s, selected: BooleanLike, shown?: BooleanLike})}
    {#if shown}
        <li class="link-item" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link ms-md-3"
                class:active={selected}
                aria-current={selected ? 'page' : null}
                href={relUrl(url)}
            >{label}</a>
        </li>
    {/if}
{/snippet}

<ul class="navbar-nav">
    {@render item({
        url: '/IN', label: t.new,
        selected: isForm && form === 'IN' && !search.has('edit-irid'),
    })}
    {@render item({
        url: '/NSP', label: t.independentServiceProtocol, shown: $isUserRegulusOrAdmin,
        selected: isForm && form === 'NSP',
    })}
    {@render item({
        url: '/search', label: t.searching, selected: route?.endsWith('/search'),
    })}
    {@render item({
        url: isDetailPage
            ? page.data.spid ? detailSpUrl() : detailIrUrl()
            : detailIrUrl(page.url.searchParams.get('edit-irid')),
        label: page.data.spid ? t.protocolDetails : t.evidenceDetails,
        selected: true, shown: isDetailPage || page.url.searchParams.has('edit-irid'),
    })}
    {@render item({
        url: '/admin', label: 'Admin', shown: $isUserAdmin, selected: page.route.id?.endsWith('/admin'),
    })}
</ul>
