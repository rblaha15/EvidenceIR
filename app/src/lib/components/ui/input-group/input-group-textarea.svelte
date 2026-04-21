<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		onInput,
		...props
	}: ComponentProps<typeof Textarea> & {
		onInput?: (text: string) => void;
	} = $props();
</script>

<Textarea
	bind:ref
	data-slot="input-group-control"
	class={cn("rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1", className)}
	bind:value
	oninput={e => onInput?.(e.currentTarget.value)}
	{...props}
/>
