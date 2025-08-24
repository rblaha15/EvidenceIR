<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { relUrl } from '$lib/helpers/runes.svelte.js';

    onMount(() => goto(relUrl('/IN')))
</script>