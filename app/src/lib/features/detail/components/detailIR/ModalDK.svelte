<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type IR } from '$lib/data';
    import { defaultDK, type FormPartDK, saveDK } from '$lib/forms/DK/formDK';
    import Widget from '$lib/components/Widget.svelte';
    import { type ContextChangeDK, getDKInfo } from '$lib/features/detail/domain/detailIR/DK';
    import { defaultFormGroupValues, type FormPartValues, widgetListFromGroup } from '$lib/forms/Form';
    import { Bell, SendHorizontal } from '@lucide/svelte';
    import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Spinner } from "$lib/components/ui/spinner";

    const { t, ir, type }: {
        t: Translations, ir: IR, type: 'TČ' | 'SOL'
    } = $props();
    const tr = $derived(t.dk);

    let showDialog = $state(false);
    let loading = $state(false);
    let error = $state(false);

    const { settings, commissionDate } = $derived(getDKInfo(type, ir));
    const f = $derived<FormPartDK<ContextChangeDK>>(defaultDK<ContextChangeDK>(type, commissionDate, settings));
    let v = $state({} as FormPartValues<FormPartDK<ContextChangeDK>>);
    $effect(() => {
        v = defaultFormGroupValues(f);
    });

    const list = $derived(widgetListFromGroup<ContextChangeDK, FormPartDK<ContextChangeDK>>(f, v));
    let showAllErrors = $state(false);
    const context = $derived({ DK: v, IN: ir.IN, mode: 'create' as const });

    $effect(() => {
        v.enabled = Boolean(settings);
        v.executingCompany = settings?.executingCompany ?? null;
    });

    const save = async () => {
        showAllErrors = true;
        if (f.executingCompany.isError(context, v.executingCompany) || f.commissionDate.isError(context, v.commissionDate)) return;
        error = false;
        loading = true;
        const success = await saveDK(ir, v, type);
        if (success)
            showDialog = false
        else {
            error = true;
            loading = false;
        }
    };

    const onOpenChange = (open: boolean) => {
        if (open) {
            showDialog = true;
            loading = false;
            error = false;
            showAllErrors = false;
        } else {
            showDialog = false;
        }
    }
</script>

<Dialog bind:open={showDialog} {onOpenChange}>
    <DialogTrigger class={buttonVariants({ variant: 'outline' })}>
        <Bell />
        {tr.settingsTitle(type)}
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
                <Bell />
                {tr.settingsTitle(type)}
            </DialogTitle>
        </DialogHeader>
        {#each list as item}
            <Widget widget={item.widget} bind:value={item.value} {t} {context} {showAllErrors} />
        {/each}
        {#if error}
            <div class="text-danger">{@html t.form.somethingWentWrongContactUsHtml}</div>
        {/if}
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'secondary' })} disabled={loading}>
                {#if loading}
                    <Spinner />
                {/if}
                {tr.cancel}
            </DialogClose>
            <Button disabled={loading} variant="warning" onclick={save}>
                {#if loading}
                    <Spinner />
                {/if}
                {#if v.enabled !== Boolean(settings) && !f.executingCompany.isError(context, v.executingCompany)}
                    <SendHorizontal />
                {/if}
                {tr.save}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>