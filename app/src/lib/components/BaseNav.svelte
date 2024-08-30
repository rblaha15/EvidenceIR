<script lang="ts">
	import { page } from '$app/stores';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';

	export let t: Translations;
</script>

<div class="collapse navbar-collapse" id="navbarSupportedContent">
	<ul class="navbar-nav">
		<a
			class="nav-link mt-3 mt-md-0"
			class:active={$page.route.id?.includes('/new')}
			aria-current={$page.route.id?.includes('/new') ? 'page' : null}
			href={$relUrl('/new')}>{t.new}</a
		>
		<a
			class="nav-link ms-md-3"
			class:active={$page.route.id?.endsWith('/search')}
			aria-current={$page.route.id?.endsWith('/search') ? 'page' : null}
			href={$relUrl('/search')}>{t.controllerSearch}</a
		>
		{#if $page.route.id?.includes('/admin')}
			<a class="nav-link ms-md-3 active" aria-current={'page'} href={$relUrl('/admin')}>Admin</a>
		{/if}
		{#if $page.route.id?.includes('/detail')}
			<a
				class="nav-link ms-md-3 active"
				aria-current={'page'}
				href={$relUrl(`/detail/${$page.data.ir ?? ''}`)}>{t.evidenceDetails}</a
			>
		{/if}
	</ul>
</div>
