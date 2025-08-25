<script lang="ts">
    import type { Translations } from '$lib/translations';
    import ThemeSelector from '$lib/components/nav/ThemeSelector.svelte';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import { removeAllFiles } from '$lib/components/widgets/File.svelte';
    import { browser, dev, version } from '$app/environment';
    import { page } from '$app/state';

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);

    const clearAll = async () => {
        localStorage.clear();
        await removeAllFiles();
        location.reload();
    };
</script>

<div class="alert alert-primary">
    <h4 class="alert-heading">{ts.userSettings}</h4>
    <div class="d-flex align-items-center"><span class="me-1">{ts.appTheme}:</span>
        <ThemeSelector {t} />
    </div>
    <div class="d-flex align-items-center"><span class="me-1">{ts.language}:</span>
        <LanguageSelector />
    </div>
    <div>{@html ts.didYouFindMistakesInTranslationsHtml}</div>
</div>

<div class="alert alert-info">
    <h4 class="alert-heading">{ts.appInfo}</h4>
    <p class="mb-0">{ts.appVersion({
        version: appVersion,
        build: version.slice(0, 7),
        type: dev ? 'DEV' : browser ? page.url.hostname.includes('dev') ? 'PREVIEW' : 'BROWSER' : 'UNKNOWN'
    })}</p>
</div>

<div class="alert alert-warning">
    <h4 class="alert-heading">{ts.clearBrowserData}</h4>
    <p>{ts.clearDataInfo}</p>
    <button class="btn btn-warning btn-sm" onclick={clearAll}>{ts.clearBrowserData}</button>
</div>