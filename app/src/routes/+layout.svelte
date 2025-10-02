<script lang="ts">
    import type { LayoutData } from './$types';
    import { onMount, type Snippet } from 'svelte';
    import MainLayout from './MainLayout.svelte';

    interface Props {
        data: LayoutData;
        children?: Snippet;
    }

    let { children, data }: Props = $props();

    onMount(() => {
        import('bootstrap');
    });
</script>

<svelte:head>
    <style lang="scss">
      @use 'bootstrap/scss/bootstrap';
      @use '../lib/components/input-groups.css';
      @use '../lib/components/styles.css';
      @use '../lib/components/toc.css';

      @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap');

      :root {
        --bs-font-sans-serif: 'Open Sans', sans-serif;
      }

      :root, html, body, body > div {
        height: 100%;
      }
    </style>
</svelte:head>

<MainLayout {children} {data} />