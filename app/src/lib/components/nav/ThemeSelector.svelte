<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { Moon, Sun, SunMoon } from "@lucide/svelte";
    import { mode, setMode } from "mode-watcher";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "$lib/components/ui/dropdown-menu";
    import { buttonVariants } from "$lib/components/ui/button";

    const { t }: { t: Translations } = $props();

    const themeSettings = $derived(t.theme.keys());
    const icons = [
        Moon,
        Sun,
        SunMoon,
    ] as const;

    const value = $derived(mode.current ?? 'system');
    const SelectedIcon = $derived(icons[themeSettings.indexOf(value)]);
    const set = (value: typeof themeSettings[number]) => () => setMode(value)
</script>

<DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>
        <SelectedIcon class="size-lg" />
        <span class="sr-only">Toggle theme</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        {#each themeSettings.zip(icons) as [theme, Icon]}
            <DropdownMenuItem onSelect={set(theme)}>
                <Icon />
                {t.theme[theme]}
            </DropdownMenuItem>
        {/each}
    </DropdownMenuContent>
</DropdownMenu>