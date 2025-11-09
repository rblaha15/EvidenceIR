<script lang="ts">
    import type { ClassValue } from 'svelte/elements';

    const { icon, class: klass }: {
        icon: string | undefined | null, class?: ClassValue,
    } = $props();
</script>

{#if icon}
    <span class={["material-icons", klass]} translate="no">{icon}</span>
{/if}

<!--suppress CssUnusedSymbol, CssNoGenericFontName -->
<style>
    :global.material-icons {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -moz-font-feature-settings: 'liga';
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        font-feature-settings: 'liga';
        vertical-align: -.25em;
        font-size: 1.375em;
    }
    @font-face {
        font-family: 'Material Icons';
        font-style: normal;
        font-weight: 400;
        src: local('Material Icons'),
        local('MaterialIcons-Regular'),
        url(/MaterialIcons-Regular.ttf) format('truetype');
    }
</style>