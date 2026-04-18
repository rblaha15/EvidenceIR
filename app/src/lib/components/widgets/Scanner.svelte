<script generics="C" lang="ts">
    import { Html5Qrcode } from 'html5-qrcode';
    import { onMount } from 'svelte';
    import type { Translations } from '$lib/translations';
    import CoreInput from '$lib/components/CoreInput.svelte';
    import type { ScannerWidget } from '$lib/forms/Widget';
    import { ScanBarcode } from "@lucide/svelte";
    import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { buttonVariants } from '../ui/button';
    import type { Attachment } from "svelte/attachments";

    interface Props {
        t: Translations;
        widget: ScannerWidget<C>;
        context: C;
        value: string;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let showDialog = $state(false);

    const reader: Attachment = () => {
        const html5QrCode = new Html5Qrcode('reader');

        Html5Qrcode.getCameras().then(devices => {

            if (devices && devices.length) html5QrCode
                .start(
                    { facingMode: 'environment' },
                    undefined,
                    decodedText => {
                        const scannedText = widget.processScannedText(decodedText, context);
                        value = scannedText;
                        widget.onValueSet(context, scannedText);
                        showDialog = false;
                    },
                    undefined,
                )
                .catch(e => {
                    console.error(e);
                    showDialog = false;
                });
        });

        return async () => {
            html5QrCode.stop();
        };
    }
</script>

{#snippet trailingContent()}
    <Dialog bind:open={showDialog}>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })} disabled={widget.lock(context)}>
            <ScanBarcode />
            {t.widget.scanBarcode}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t.widget.scanCode}</DialogTitle>
            </DialogHeader>
            <div class="flex justify-content-center">
                <div class="w-full" id="reader" {@attach reader}></div>
            </div>
            <DialogFooter>
                <DialogClose class={buttonVariants({ variant: 'destructive' })}>{t.widget.cancel}</DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
{/snippet}

<CoreInput
    bind:showError bind:value {context} setTextValue={text => text} {t} textValue={value} {trailingContent}
    {widget}
/>