<script lang="ts">
    import type { Translations } from '$lib/translations';
    import ThemeSelector from '$lib/components/nav/ThemeSelector.svelte';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import { removeAllFiles } from '$lib/components/widgets/File.svelte';
    import { browser, dev, version } from '$app/environment';

    interface Props {
        t: Translations;
    }

    const { t }: Props = $props();

    const clearAll = async () => {
        localStorage.clear();
        await removeAllFiles();
        location.reload();
    };
</script>

<div class="alert alert-primary">
    <h4 class="alert-heading">{t.settings.userSettings}</h4>
    <div class="d-flex align-items-center"><span class="me-1">{t.settings.appTheme}:</span>
        <ThemeSelector {t} />
    </div>
    <div class="d-flex align-items-center"><span class="me-1">{t.settings.language}:</span>
        <LanguageSelector />
    </div>
</div>

<div class="alert alert-info">
    <h4 class="alert-heading">{t.settings.appInfo}</h4>
    <p class="mb-0">{t.settings.appVersion({
        version: appVersion,
        build: version.slice(0, 7),
        type: dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'
    })}</p>
</div>

<div class="alert alert-warning">
    <h4 class="alert-heading">{t.settings.clearBrowserData}</h4>
    <p>{t.settings.clearDataInfo}</p>
    <button class="btn btn-warning btn-sm" onclick={clearAll}>{t.settings.clearBrowserData}</button>
</div>