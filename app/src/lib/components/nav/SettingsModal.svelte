<script lang="ts">
    import Settings from '$lib/components/nav/Settings.svelte';
    import type { Translations } from '$lib/translations';
    import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { SettingsIcon } from '@lucide/svelte';
    import { buttonVariants } from "$lib/components/ui/button";

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);
</script>

<Dialog>
    <DialogTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <SettingsIcon class="size-8" />
        <span class="sr-only">{ts.title}</span>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{ts.title}</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col gap-4">
            <Settings {t} />
        </div>
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'default' })}>{ts.close}</DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>