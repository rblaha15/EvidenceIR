<script lang="ts">
	import type { HTMLOptionAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from '$lib/utils';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: WithElementRef<HTMLOptionAttributes> = $props();
</script>

<option bind:this={ref} data-slot="native-select-option" class={cn(
	'bg-background text-foreground',
	className,
)} {...restProps}>
	{@render children?.()}
</option>
