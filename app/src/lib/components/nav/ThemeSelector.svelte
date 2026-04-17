<script lang="ts">
    import { storableState } from '$lib/helpers/runes.svelte.js';
    import type { Translations } from '$lib/translations';
    import Button from '$lib/components/Button.svelte';
    import { Check, Moon, MoonIcon, Sun, SunMoon } from "@lucide/svelte";

    const { t }: { t: Translations } = $props();

    const themeSettings = t.theme.keys();
    type ThemeSetting = typeof themeSettings[number];
    type Theme = Exclude<ThemeSetting, 'auto'>;
    const media = '(prefers-color-scheme: dark)';
    const icons = [
        Moon,
        Sun,
        SunMoon,
    ] as const;

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
    <Button label="Toggle theme" icon={selectedIcon}
            class="dropdown-toggle flex items-center" toggleDropdown />
    <ul class="dropdown-menu hidden">
        {#each themeSettings.zip(icons) as [theme, Icon]}
            <li>
                <button
                    type="button" class="dropdown-item flex items-center"
                    class:active={storedTheme.value === theme}
                    aria-pressed={storedTheme.value === theme}
                    onclick={() => {
                        storedTheme.value = theme;
                        setTheme(theme);
                        document.querySelector<HTMLElement>('#bd-theme')?.focus();
                    }}
                >
                    <Icon class="me-2" />
                    {t.theme[theme]}
                    <Check class={['ms-auto', storedTheme.value === theme ? 'inline' : 'hidden']} />
                </button>
            </li>
        {/each}
    </ul>
</div>