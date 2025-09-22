<script lang="ts">
    import { storableState } from '$lib/helpers/runes.svelte.js';
    import type { Translations } from '$lib/translations';

    const { t }: { t: Translations } = $props();

    const themeSettings = t.theme.keys();
    type ThemeSetting = typeof themeSettings[number];
    type Theme = Exclude<ThemeSetting, 'auto'>;
    const media = '(prefers-color-scheme: dark)';
    const icons = ['dark_mode', 'light_mode', 'contrast'] as const;

    const storedTheme = storableState<ThemeSetting>('theme', 'auto');

    const setThemeToDocument = (theme: Theme) =>
        document.documentElement.setAttribute('data-bs-theme', theme);
    const getSystemTheme = (): Theme =>
        window.matchMedia(media).matches ? 'dark' : 'light';
    const setTheme = (theme: ThemeSetting) =>
        setThemeToDocument(theme === 'auto' ? getSystemTheme() : theme);

    setTheme(storedTheme.value);

    window.matchMedia(media).addEventListener('change', () => {
        if (storedTheme.value === 'auto') setTheme('auto');
    });

    const selectedIcon = $derived(icons[themeSettings.indexOf(storedTheme.value)])
</script>

<div class="dropdown">
    <button
        aria-label="Toggle theme"
        class="btn dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown"
    >
        <span class="material-icons">{selectedIcon}</span>
    </button>
    <ul class="dropdown-menu">
        {#each themeSettings.zip(icons) as [theme, icon]}
            <li>
                <button
                    type="button" class="dropdown-item d-flex align-items-center"
                    class:active={storedTheme.value === theme}
                    aria-pressed={storedTheme.value === theme}
                    onclick={() => {
                        storedTheme.value = theme;
                        setTheme(theme);
                        document.querySelector<HTMLElement>('#bd-theme')?.focus();
                    }}
                >
                    <span class="material-icons me-2">{icon}</span>
                    {t.theme[theme]}
                    <span class="material-icons ms-auto" class:d-none={storedTheme.value !== theme}>check</span>
                </button>
            </li>
        {/each}
    </ul>
</div>