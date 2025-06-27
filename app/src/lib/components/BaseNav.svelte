<script lang="ts">
    import { page } from '$app/state';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { isIRID } from "$lib/helpers/ir";

    const { t }: { t: Translations } = $props();
    type BooleanLike = boolean | null | undefined
    type s = string
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
        url: '/new', label: t.new,
        selected: page.route.id?.match(/.*\/new($|\?)/) && !page.url.searchParams.has('edit-irid'),
    })}
    {@render item({
        url: '/newSP', label: t.independentServiceProtocol, shown: $isUserRegulusOrAdmin,
        selected: page.route.id?.endsWith('/newSP'),
    })}
    {@render item({
        url: '/search', label: t.searching, selected: page.route.id?.endsWith('/search'),
    })}
    {@render item({
        url: page.route.id?.includes('/detail') ? `/detail/${page.data.id ?? ''}` : `/detail/${page.url.searchParams.get('edit-irid') ?? ''}`,
        label: page.data.id && isIRID(page.data.id) ? t.evidenceDetails : t.protocolDetails,
        selected: true, shown: page.route.id?.includes('/detail') || page.url.searchParams.has('edit-irid'),
    })}
    {@render item({
        url: '/admin', label: 'Admin', shown: $isUserAdmin, selected: page.route.id?.endsWith('/admin'),
    })}
</ul>
