<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import Detail from '$lib/features/detail/components/Detail.svelte';

    let { data }: PageProps = $props();
    const { irid, spids, ir, sps, languageCode: lang, translations: t } = $derived(data);
    const td = $derived(t.detail);

    const justDeleted = $derived(page.url.searchParams.has('deleted'));

    $effect(() => setTitle(spids.length ? spids.length > 1 ? td.titleNSPs : td.titleNSP : td.titleIR, true));
</script>

<Detail ir={$ir} sps={$sps} {spids} {irid} {lang} {t} {justDeleted} />