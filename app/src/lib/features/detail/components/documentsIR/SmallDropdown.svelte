<script lang="ts">
    import type { DropdownItems } from '$lib/features/detail/domain/documentsIR/createDocumentLinks';
    import { EllipsisVertical } from '@lucide/svelte';

    const { dropdownItems }: {
        dropdownItems: DropdownItems
    } = $props();
</script>

<button aria-expanded="false" class="btn btn-outline-secondary" data-bs-toggle="dropdown"
        style="--bs-btn-padding-x: 0" type="button">
    <EllipsisVertical />
    <span class="visually-hidden">Toggle dropdown with other options</span>
</button>

<div class="dropdown-menu hidden">
    <div class="flex flex-col gap-1 px-4 py-2 items-start">
        {#each dropdownItems ?? [] as item}
            {#if !item.hide}
                {#if 'color' in item}
                    <a class="btn btn-{item.color}" href={item.href} tabindex="0">
                        <item.icon />
                        {item.text}
                    </a>
                {:else if 'item' in item}
                    {@render item.item()}
                {:else}
                    <h6 class="m-0">{item.text}</h6>
                {/if}
            {/if}
        {/each}
    </div>
</div>