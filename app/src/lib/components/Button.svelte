<script lang="ts" module>
    import type { Color } from '$lib/forms/Widget.svelte';
    import type { ClassValue, EventHandler, HTMLAttributeAnchorTarget } from 'svelte/elements';
    import type { Snippet } from 'svelte';

    type AtLeastOne<T> = {
        [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>
    }[keyof T]

    type IconSettings = {
        icon?: string,
        iconClass?: ClassValue,
    } | {
        icons: string[],
    };
    type AnchorSettings = {
        href: string,
        target?: HTMLAttributeAnchorTarget,
        dismissModal?: boolean,
        element?: HTMLAnchorElement,
    };
    type ButtonElementSettings = {
        element?: HTMLButtonElement,
    } & AtLeastOne<{
        modalID: string,
        offcanvasID: string,
        onclick: EventHandler<MouseEvent, HTMLButtonElement>,
        dismissModal: boolean,
        toggleDropdown: boolean,
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
        color?: Color,
        link?: boolean,
        square?: boolean,
        outline?: boolean,
        class?: ClassValue,
    } & LabelSettings & IconSettings;
    export type ButtonSettings = StyleSettings & ActionSettings
</script>

<script lang="ts">
    import Icon from '$lib/components/Icon.svelte';

    let {
        element = $bindable(),
        ...settings
    }: ButtonSettings = $props();

    const outline = $derived(settings.outline ? 'outline-' : '');
    const color = $derived(settings.link ? ['btn', 'btn-link']
        : settings.color ? ['btn', `btn-${outline}${settings.color}`] : '');
    const square = $derived({ square: settings.square });
    const klass = $derived([color, 'text-nowrap', square, settings.class]);
    const icons = $derived('icons' in settings ? settings.icons : settings.icon ? [settings.icon] : []);
    const children = $derived(settings.children || settings.content);
</script>

{#snippet content()}
    {#each icons as icon}
        <Icon {icon} class={'iconClass' in settings ? settings.iconClass : undefined} />
    {/each}
    {#if settings.text}
        {settings.text}
    {/if}
    {@render children?.()}
{/snippet}

{#if 'href' in settings}
    <a
        class={[klass, { disabled: settings.disabled }]}
        href={settings.href}
        target={settings.target}
        tabindex="0"
        data-bs-dismiss={settings.dismissModal ? "modal" : undefined}
        bind:this={element}
        aria-label={settings.label}
    >{@render content()}</a>
{:else}
    <button
        type="button"
        class={klass}
        disabled={settings.disabled}
        data-bs-toggle={settings.modalID ? 'modal' : settings.offcanvasID ? 'offcanvas'
            : settings.toggleDropdown ? 'dropdown' : undefined}
        data-bs-target={settings.modalID || settings.offcanvasID
            ? `#${settings.modalID || settings.offcanvasID}` : undefined}
        aria-controls={settings.modalID || settings.offcanvasID}
        onclick={e => settings.onclick?.(e)}
        data-bs-dismiss={settings.dismissModal ? "modal" : undefined}
        bind:this={element}
        aria-label={settings.label}
    >{@render content()}</button>
{/if}

<!--suppress CssUnusedSymbol -->
<style>
    button.square {
        --bs-btn-padding-x: var(--bs-btn-padding-y)
    }
</style>