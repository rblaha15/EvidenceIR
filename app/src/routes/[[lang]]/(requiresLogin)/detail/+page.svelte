<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import Detail from '$lib/features/detail/components/Detail.svelte';
    import { onMount } from "svelte";

    let { data }: PageProps = $props();
    const { irid, nspids, ir, nsps, languageCode: lang, translations: t } = $derived(data);
    const td = $derived(t.detail);

    const justDeleted = $derived(page.url.searchParams.has('deleted'));

    onMount(() => setTitle(nspids.length ? nspids.length > 1 ? td.titleNSPs : td.titleNSP : td.titleIR, true));
</script>

<Detail ir={$ir} nsps={$nsps} {nspids} {irid} {lang} {t} {justDeleted} />