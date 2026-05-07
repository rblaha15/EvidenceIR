<script lang="ts" module>
    import { cn, type WithElementRef } from '$lib/utils.js';
    import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
    import { tv, type VariantProps } from 'tailwind-variants';

    export const buttonVariants = tv({
        base:
            `group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent\n` +
            `bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none not-disabled:not-aria-[disabled=true]:cursor-pointer\n` +
            `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px\n` +
            `disabled:pointer-events-none disabled:opacity-50\n` +
            `aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-danger/20\n` +
            `aria-[disabled=true]:pointer-events-none aria-[disabled=true]:opacity-50\n` +
            `dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40\n` +
            `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        variants: {
            variant: {
                primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-secondary-foreground/60',
                tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/80',
                success: 'bg-success text-success-foreground hover:bg-success/80',
                danger: 'bg-danger text-danger-foreground hover:bg-danger/80',
                warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
                outline: 'bg-secondary/30 border-secondary-foreground/40 hover:bg-secondary/80',
                ghost: 'hover:bg-secondary/80',
                link: 'text-tertiary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
                xs: `h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3`,
                sm: 'h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                lg: 'h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
                icon: 'size-9',
                'icon-xs': `size-6 [&_svg:not([class*='size-'])]:size-3`,
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    });

    export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
    export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

    export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
        WithElementRef<HTMLAnchorAttributes> & {
            variant?: ButtonVariant;
            size?: ButtonSize;
        };
</script>

<script lang="ts">
    let {
        class: className,
        variant = 'primary',
        size = 'default',
        ref = $bindable(null),
        href = undefined,
        type = 'button',
        disabled,
        children,
        ...restProps
    }: ButtonProps = $props();
</script>

{#if href}
    <a
        bind:this={ref}
        data-slot="button"
        class={cn(buttonVariants({ variant, size }), className)}
        href={disabled ? undefined : href}
        aria-disabled={disabled}
        role={disabled ? 'link' : undefined}
        tabindex={disabled ? -1 : undefined}
        {...restProps}
    >
        {@render children?.()}
    </a>
{:else}
    <button bind:this={ref} data-slot="button" class={cn(buttonVariants({ variant, size }), className)} {type} {disabled} {...restProps}>
        {@render children?.()}
    </button>
{/if}
