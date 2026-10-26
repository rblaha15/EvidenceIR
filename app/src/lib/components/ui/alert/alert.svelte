<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const alertVariants = tv({
		base: "grid gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-[>svg]:gap-x-2.5 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 group/alert relative w-full " +
			"has-[>svg]:has-data-[slot=alert-action]:grid-cols-[auto_1fr_auto] has-[>svg]:not-has-data-[slot=alert-action]:grid-cols-[auto_1fr] not-has-[>svg]:has-data-[slot=alert-action]:grid-cols-[1fr_auto] " +
			"*:[svg]:row-span-2 has-data-[slot=alert-action]:[&>[data-slot=alert-description]]:col-span-2",
		variants: {
			variant: {
				default: "bg-card text-card-foreground",
				danger: "text-danger bg-card *:data-[slot=alert-description]:text-danger/90 *:[svg]:text-current",
				success: "bg-success/50 *:data-[slot=alert-description]:text-success-foreground *:[svg]:text-current",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type AlertVariant = VariantProps<typeof alertVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	role="alert"
	class={cn(alertVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
