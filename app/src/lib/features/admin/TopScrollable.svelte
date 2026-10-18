<script lang="ts">
    import type { Snippet } from "svelte";

    const { children }: { children: Snippet } = $props();
</script>

<div class="A">
    <div class="B">
        <div class="C">
            {@render children()}
        </div>
    </div>
</div>


<style>
    .B, .C {
        transform: rotateX(180deg);
    }
    .B {
        overflow-x: auto;
    }
    .A {
        overflow-y: visible;
    }
</style>