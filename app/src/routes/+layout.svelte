<script lang="ts">
    import './layout.css';
    import '../lib/components/input-groups.css';
    import '../lib/components/toc.css';
    import favicon from '$lib/assets/ic_r.png';
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import MainLayout from "./MainLayout.svelte";

    interface Props {
        data: LayoutData;
        children?: Snippet;
    }

    let { children, data }: Props = $props();
</script>

<svelte:head>
    <link href={favicon} rel="icon" />
</svelte:head>

<MainLayout {children} {data} />
