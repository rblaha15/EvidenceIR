<script lang="ts">
	import { page } from '$app/stores';
	import { isUserAdmin } from '$lib/client/auth';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';

	interface Props {
		t: Translations;
	}

	let { t }: Props = $props();
</script>

<ul class="navbar-nav">
	<li class="link-item" data-bs-dismiss="offcanvas">
		<a
			class="nav-link mt-3 mt-sm-0"
			class:active={$page.route.id?.includes('/new')}
			aria-current={$page.route.id?.includes('/new') ? 'page' : null}
			href={$relUrl('/new')}>{t.new}</a
		>
	</li>
	<li class="link-item" data-bs-dismiss="offcanvas">
		<a
			class="nav-link ms-sm-3"
			class:active={$page.route.id?.endsWith('/search')}
			aria-current={$page.route.id?.endsWith('/search') ? 'page' : null}
			href={$relUrl('/search')}>{t.controllerSearch}</a
		>
	</li>
	{#if $page.route.id?.includes('/detail')}
		<li class="link-item" data-bs-dismiss="offcanvas">
			<a
				class="nav-link ms-sm-3 active"
				aria-current={'page'}
				href={$relUrl(`/detail/${$page.data.ir ?? ''}`)}>{t.evidenceDetails}</a
			>
		</li>
	{/if}
	{#if $isUserAdmin}
		<li class="link-item" data-bs-dismiss="offcanvas">
			<a
				class="nav-link ms-sm-3"
				class:active={$page.route.id?.endsWith('/admin')}
				aria-current={$page.route.id?.endsWith('/admin') ? 'page' : null}
				href={$relUrl('/admin')}>Admin</a
			>
		</li>
	{/if}
</ul>
