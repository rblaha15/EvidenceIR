<script lang="ts">
	import type { Translations } from '$lib/translations';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { removeAllPhotos } from '$lib/components/widgets/PhotoSelector.svelte';
	import { browser, dev, version } from '$app/environment';

	interface Props {
		t: Translations;
	}

	const { t }: Props = $props();

	const clearAll = async () => {
		localStorage.clear();
		await removeAllPhotos();
		window.location.reload();
	};
</script>

<div class="alert alert-primary">
    <h4 class="alert-heading">Uživatelská nastavení</h4>
    <div class="d-flex align-items-center"><span class="me-1">{t.appTheme}:</span>
        <ThemeSelector {t} />
    </div>
    <div class="d-flex align-items-center"><span class="me-1">{t.language}:</span>
        <LanguageSelector />
    </div>
</div>

<div class="alert alert-info">
    <h4 class="alert-heading">Informace o aplikaci</h4>
    <p class="mb-0">Verze aplikace: {appVersion} ({version.slice(0, 7)}) ({dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})</p>
</div>

<div class="alert alert-warning">
    <h4 class="alert-heading">Vyčistit data z prohlížeče</h4>
    <p>Data stránky v prohlížeči obsahují vaše uživatelská nastavení, stránky uložené do offline režimu a všechny rozepsané formuláře. Neodstraní se žádná data,
        která již byla uložena a odeslána na server. Nebudete odhlášeni ze svého účtu.</p>
    <button class="btn btn-warning btn-sm" onclick={clearAll}>Vyčistit data z prohlížeče</button>
</div>