<script lang="ts">
    import { page } from '$app/state';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { Translations } from '$lib/translations';
    import { relUrl } from '$lib/helpers/runes.svelte';

    interface Props {
        t: Translations;
    }

    let { t }: Props = $props();
</script>

<ul class="navbar-nav">
    <li class="link-item" data-bs-dismiss="offcanvas">
        <a
            tabindex="0"
            aria-current={page.route.id?.match(/.*\/new($|\?)/) && !page.url.searchParams.has('edit-irid') ? 'page' : null}
            class="nav-link mt-3 mt-sm-0"
            class:active={page.route.id?.match(/.*\/new($|\?)/) && !page.url.searchParams.has('edit-irid')}
            href={relUrl('/new')}>{t.new}</a
        >
    </li>
    {#if $isUserRegulusOrAdmin}
        <li class="link-item" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link ms-sm-3"
                class:active={page.route.id?.endsWith('/newSP')}
                aria-current={page.route.id?.endsWith('/newSP') ? 'page' : null}
                href={relUrl('/newSP')}>Nezávislý servisní protokol</a
            >
        </li>
    {/if}
    <li class="link-item" data-bs-dismiss="offcanvas">
        <a
            tabindex="0"
            aria-current={page.route.id?.endsWith('/search') ? 'page' : null}
            class="nav-link ms-sm-3"
            class:active={page.route.id?.endsWith('/search')}
            href={relUrl('/search')}>{t.controllerSearch}</a
        >
    </li>
    {#if page.route.id?.includes('/detail') || page.url.searchParams.has('edit-irid')}
        <li class="link-item" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link ms-sm-3 active"
                aria-current={'page'}
                href={
                    page.route.id?.includes('/detail')
                        ? relUrl(`/detail/${page.data.irid ?? ''}`)
                        : relUrl(`/detail/${page.url.searchParams.get('edit-irid') ?? ''}`)
                }
            >{t.evidenceDetails}</a>
        </li>
    {/if}
    {#if $isUserAdmin}
        <li class="link-item" data-bs-dismiss="offcanvas">
            <a
                tabindex="0"
                class="nav-link ms-sm-3"
                class:active={page.route.id?.endsWith('/admin')}
                aria-current={page.route.id?.endsWith('/admin') ? 'page' : null}
                href={relUrl('/admin')}>Admin</a
            >
        </li>
    {/if}
</ul>
