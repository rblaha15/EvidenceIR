<script lang="ts">
    import Logo from '$lib/assets/Logo.svelte';

    const { texts1, texts2 }: {
        texts1: string[];
        texts2: string[];
    } = $props();

    const t1 = $derived(texts1.length);
</script>

<svg
    height="600"
    width="1200"
    xmlns="http://www.w3.org/2000/svg"
>
    <rect fill="white" height="600" width="1200" />
    <rect fill="#d9081d" height="100" width="1200" />

    <g color="white">
        <g transform="translate(16 16) scale(0.503972973)">
            <Logo class="logo" />
        </g>
        <text
            fill="currentColor" font-family="Ubuntu-Regular"
            font-size="32"
            font-weight="600"
            x="203.431446514"
            y="60"
        >SEIR</text>
    </g>

    {#each texts1 as text, i}
        <text
            x="32"
            y={100 + 32 + 69 + i * 89 + i * 16}
            font-size="64"
            font-family="Ubuntu-Regular"
        >
            {text}
        </text>
    {/each}
    {#each texts2 as text, i}
        <text
            x="32"
            y={100 + 32 + t1 * 89 + (t1 - 1) * 16 + 32 + 51 + i * 67 + i * 8}
            font-size="48"
            font-family="Ubuntu-Regular"
        >
            {text}
        </text>
    {/each}
</svg>