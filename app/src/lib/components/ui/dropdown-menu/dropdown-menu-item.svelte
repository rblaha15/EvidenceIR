<script lang="ts">
    import { cn } from '$lib/utils.js';
    import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

    let {
        ref = $bindable(null),
        class: className,
        inset,
        variant = 'default',
        ...restProps
    }: DropdownMenuPrimitive.ItemProps & {
        inset?: boolean;
        variant?: 'default' | 'danger' | 'warning' | 'tertiary';
    } = $props();
</script>

<DropdownMenuPrimitive.Item
    bind:ref
    data-slot="dropdown-menu-item"
    data-inset={inset}
    data-variant={variant}
    class={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-9.5 data-[variant=default]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-[variant=danger]:text-danger data-[variant=danger]:focus:bg-danger/10 data-[variant=danger]:focus:text-danger dark:data-[variant=danger]:focus:bg-danger/20 data-[variant=danger]:*:[svg]:text-danger',
        'data-[variant=warning]:text-warning-alt data-[variant=warning]:focus:bg-warning-alt/10 data-[variant=warning]:focus:text-warning-alt dark:data-[variant=warning]:focus:bg-warning-alt/20 data-[variant=warning]:*:[svg]:text-warning-alt',
        'data-[variant=tertiary]:text-tertiary data-[variant=tertiary]:focus:bg-tertiary/10 data-[variant=tertiary]:focus:text-tertiary dark:data-[variant=tertiary]:focus:bg-tertiary/20 data-[variant=tertiary]:*:[svg]:text-tertiary',
        className,
    )}
    {...restProps}
/>
