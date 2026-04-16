<script lang="ts" module>
    import type { ClassValue, EventHandler, HTMLAttributeAnchorTarget } from 'svelte/elements';
    import type { Component, Snippet } from 'svelte';
    import type { LucideProps } from "@lucide/svelte";
    import type { ButtonSize, ButtonVariant } from "$lib/components/ui/button";
    import type { AtLeastOne } from "$lib/utils";

    type IconSettings = {
        icon?: Component<LucideProps>,
        iconClass?: ClassValue,
    } | {
        icons: Component<LucideProps>[],
    };
    type AnchorSettings = {
        href: string,
        target?: HTMLAttributeAnchorTarget,
        // dismissModal?: boolean,
        ref?: HTMLAnchorElement | null,
    };
    type ButtonElementSettings = {
        ref?: HTMLButtonElement | null,
    } & AtLeastOne<{
        // modalID: string,
        // offcanvasID: string,
        onclick: EventHandler<MouseEvent, HTMLButtonElement>,
        // dismissModal: boolean,
        // toggleDropdown: boolean,
    }>;
    type ActionSettings = AnchorSettings | ButtonElementSettings;
    type LabelSettings = AtLeastOne<{
        text: string,
        children: Snippet,
        content: Snippet,
        label: string,
    }>
    type StyleSettings = {
        disabled?: boolean,
        variant?: ButtonVariant;
        size?: ButtonSize;
        class?: ClassValue,
    } & LabelSettings & IconSettings;
    export type ButtonSettings = StyleSettings & ActionSettings
</script>

<script lang="ts">
    import { Button } from "$lib/components/ui/button";

    let {
        ref = $bindable(null),
        ...settings
    }: ButtonSettings = $props();

    const icons = $derived('icons' in settings ? settings.icons : settings.icon ? [settings.icon] : []);
    const children = $derived(settings.children || settings.content);
</script>

<Button
    disabled={settings.disabled}
    href={'href' in settings ? settings.href : undefined}
    target={'href' in settings ? settings.target : undefined}
    tabindex={0}
    aria-label={settings.label}
    variant={settings.variant}
    size={settings.size}
    class={settings.class}
    bind:ref
>
    {#if settings.text}
        {settings.text}
    {:else}
        {#each icons as Icon}
            <Icon class={'iconClass' in settings ? settings.iconClass : undefined} />
        {/each}
    {/if}
    {@render children?.()}
</Button>