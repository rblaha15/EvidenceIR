<script lang="ts" module>
    import { type VariantProps, tv } from 'tailwind-variants';

    export const toggleVariants = tv({
        base: "group/toggle inline-flex cursor-pointer items-center justify-center gap-1 rounded-4xl border border-input text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variants: {
            variant: {
                default: 'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground',
                outline: 'bg-transparent aria-pressed:bg-muted',
                positive: 'aria-pressed:border-success aria-pressed:bg-success aria-pressed:text-success-foreground',
                negative: 'aria-pressed:border-danger aria-pressed:bg-danger aria-pressed:text-danger-foreground',
            },
            size: {
                default: 'h-9 min-w-9 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
                sm: 'h-8 min-w-8 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                lg: 'h-10 min-w-10 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    });

    export type ToggleVariant = VariantProps<typeof toggleVariants>['variant'];
    export type ToggleSize = VariantProps<typeof toggleVariants>['size'];
    export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
    import { Toggle as TogglePrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    let {
        ref = $bindable(null),
        pressed = $bindable(false),
        class: className,
        size = 'default',
        variant = 'default',
        ...restProps
    }: TogglePrimitive.RootProps & {
        variant?: ToggleVariant;
        size?: ToggleSize;
    } = $props();
</script>

<TogglePrimitive.Root bind:ref bind:pressed data-slot="toggle" class={cn(toggleVariants({ variant, size }), className)} {...restProps} />
