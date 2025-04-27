<script lang="ts">
    import type { Translations } from '$lib/translations';
    import ThemeSelector from "$lib/components/ThemeSelector.svelte";
    import LanguageSelector from "$lib/components/LanguageSelector.svelte";
    import { removeAllPhotos } from "$lib/components/widgets/PhotoSelector.svelte";
    import { browser, dev, version } from "$app/environment";

    interface Props {
        t: Translations;
    }

    const { t }: Props = $props();

    const clearAll = async () => {
        localStorage.clear()
        await removeAllPhotos()
        window.location.reload()
    }
</script>

<p class="d-flex align-items-center"><span class="me-1">{t.appTheme}:</span>
    <ThemeSelector {t} />
</p>
<p class="d-flex align-items-center"><span class="me-1">{t.language}:</span>
    <LanguageSelector />
</p>

<p>Verze aplikace: {appVersion} ({dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})</p>
<p>Commit: {version}</p>
<button class="btn btn-danger" onclick={clearAll}>Vymazat všechny uložené formuláře</button>