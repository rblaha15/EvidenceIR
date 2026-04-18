<script lang="ts">
    import type { Translations } from '$lib/translations';
    import ThemeSelector from '$lib/components/nav/ThemeSelector.svelte';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import { removeAllFiles } from '$lib/components/widgets/File.svelte';
    import { browser, dev, version } from '$app/environment';
    import { page } from '$app/state';
    import { currentPreferredDocumentLanguage, setUserPreferredLanguage } from '$lib/languages';
    import { goto } from '$app/navigation';
    import { setUserPreferredDocumentLanguage } from '$lib/languages.js';
    import { hideNav } from '$lib/helpers/globals';
    import { clearLocalDatabase } from '$lib/client/offline.svelte';
    import { clearHistory } from '$lib/client/history.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { Separator } from "$lib/components/ui/separator";
    import { Button } from "$lib/components/ui/button";

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);

    const clearAll = async () => {
        localStorage.clear();
        await removeAllFiles();
        await clearLocalDatabase();
        await clearHistory();
        await (await caches.keys()).map(name => caches.delete(name)).awaitAll();
        location.reload();
    };

    const redirect = (code: LanguageCode) => goto(
        '/' + code + page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
        { replaceState: true, invalidateAll: true },
    );
</script>

<div class="flex flex-col items-start gap-1">
    <h3>{ts.userSettings}</h3>
    <div class="flex items-center gap-1">
        <p>{ts.appTheme}:</p>
        <ThemeSelector {t} />
    </div>
    <div class="flex items-center gap-1">
        <p>{ts.language}:</p>
        <LanguageSelector onChange={code => {
        setUserPreferredLanguage(code);
        return redirect(code);
    }} selected={page.data.languageCode} />
    </div>
    {#if !$hideNav}
        <div class="flex items-center gap-1">
            <p>{ts.defaultDocumentLanguage}:</p>
            <LanguageSelector onChange={code => {
            setUserPreferredDocumentLanguage(code);
        }} selected={$currentPreferredDocumentLanguage ?? '—'} />
        </div>
    {/if}
    <p>{@html ts.didYouFindMistakesInTranslationsHtml}</p>
</div>

<Separator />

<div class="flex flex-col items-start gap-1">
    <h3>{ts.appInfo}</h3>
    <p>{ts.appVersion({
        version: appVersion,
        build: version.slice(0, 7),
        type: dev ? 'DEV' : browser ? page.url.hostname.includes('dev') ? 'PREVIEW' : 'BROWSER' : 'UNKNOWN'
    })}</p>
</div>

<Separator />

{#if !$hideNav}
    <div class="flex flex-col items-start gap-1">
        <h3>{ts.clearBrowserData}</h3>
        <p>{ts.clearDataInfo}</p>
        <Button variant="warning" size="sm" onclick={clearAll}>{ts.clearBrowserData}</Button>
    </div>

    <Separator />
{/if}