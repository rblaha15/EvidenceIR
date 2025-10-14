<script lang="ts">
    import type { Translations } from '$lib/translations';
    import ThemeSelector from '$lib/components/nav/ThemeSelector.svelte';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import { removeAllFiles } from '$lib/components/widgets/File.svelte';
    import { browser, dev, version } from '$app/environment';
    import { page } from '$app/state';
    import { currentPreferredDocumentLanguage, type LanguageCode, setUserPreferredLanguage } from '$lib/languages';
    import { goto } from '$app/navigation';
    import { setUserPreferredDocumentLanguage } from '$lib/languages.js';
    import { hideNav } from '$lib/helpers/globals';
    import { clearLocalDatabase } from '$lib/client/offline.svelte';
    import { clearOfflineQueue } from '$lib/client/offlineQueue.svelte';

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);

    const clearAll = async () => {
        localStorage.clear();
        await removeAllFiles();
        await clearLocalDatabase();
        await clearOfflineQueue();
        await (await caches.keys()).map(name => caches.delete(name)).awaitAll();
        location.reload();
    };

    const redirect = (code: LanguageCode) => goto(
        '/' + code + page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
        { replaceState: true, invalidateAll: true },
    );
</script>

<div class="alert alert-primary">
    <h4 class="alert-heading">{ts.userSettings}</h4>
    <div class="d-flex align-items-center"><span class="me-1">{ts.appTheme}:</span>
        <ThemeSelector {t} />
    </div>
    <div class="d-flex align-items-center"><span class="me-1">{ts.language}:</span>
        <LanguageSelector onChange={code => {
            setUserPreferredLanguage(code);
            return redirect(code);
        }} selected={page.data.languageCode} />
    </div>
    {#if !$hideNav}
        <div class="d-flex align-items-center"><span class="me-1">{ts.defaultDocumentLanguage}:</span>
            <LanguageSelector onChange={code => {
                setUserPreferredDocumentLanguage(code);
            }} selected={$currentPreferredDocumentLanguage ?? '—'} />
        </div>
    {/if}
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

{#if !$hideNav}
    <div class="alert alert-warning">
        <h4 class="alert-heading">{ts.clearBrowserData}</h4>
        <p>{ts.clearDataInfo}</p>
        <button class="btn btn-warning btn-sm" onclick={clearAll}>{ts.clearBrowserData}</button>
    </div>
{/if}