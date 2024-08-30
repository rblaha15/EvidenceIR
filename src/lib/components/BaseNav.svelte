<script lang="ts">
	import { page } from '$app/stores';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';

	export let t: Translations;
</script>

<div class="collapse navbar-collapse" id="navbarSupportedContent">
	<ul class="navbar-nav">
		<li class="link-item">
			<a
				class="nav-link mt-3 mt-md-0"
				class:active={$page.route.id?.includes('/new')}
				aria-current={$page.route.id?.includes('/new') ? 'page' : null}
				href={$relUrl('/new')}>{t.new}</a
			>
		</li>
		<li class="link-item">
			<a
				class="nav-link ms-md-3"
				class:active={$page.route.id?.endsWith('/search')}
				aria-current={$page.route.id?.endsWith('/search') ? 'page' : null}
				href={$relUrl('/search')}>{t.controllerSearch}</a
			>
		</li>
		{#if $page.route.id?.includes('/admin')}
			<li class="link-item">
				<a class="nav-link ms-md-3 active" aria-current={'page'} href={$relUrl('/admin')}>Admin</a>
			</li>
		{/if}
		{#if $page.route.id?.includes('/detail')}
			<li class="link-item">
				<a
					class="nav-link ms-md-3 active"
					aria-current={'page'}
					href={$relUrl(`/detail/${$page.data.ir ?? ''}`)}>{t.evidenceDetails}</a
				>
			</li>
		{/if}
	</ul>
</div>
