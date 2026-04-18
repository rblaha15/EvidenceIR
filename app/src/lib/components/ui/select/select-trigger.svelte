<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import { cn, type WithoutChild } from "$lib/utils.js";
    import { ChevronDownIcon } from '@lucide/svelte';

    let {
        ref = $bindable(null),
        class: className,
        children,
        size = "default",
        hideChevron,
        ...restProps
    }: WithoutChild<SelectPrimitive.TriggerProps> & {
        size?: "sm" | "default";
        hideChevron?: boolean;
    } = $props();
</script>

<SelectPrimitive.Trigger
    {...restProps}
    bind:ref
    class={cn(
		"border-input data-placeholder:text-muted-foreground bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-4xl border px-3 py-2 text-sm transition-colors focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
		className
	)}
    data-size={size}
    data-slot="select-trigger"
>
    {@render children?.()}
    {#if !hideChevron}
        <ChevronDownIcon class="text-muted-foreground size-4 pointer-events-none" />
    {/if}
</SelectPrimitive.Trigger>
