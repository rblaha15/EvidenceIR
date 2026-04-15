<script generics="C" lang="ts">
    import { Html5Qrcode } from 'html5-qrcode';
    import { onMount } from 'svelte';
    import type { Translations } from '$lib/translations';
    import Button from '$lib/components/Button.svelte';
    import CoreInput from '$lib/components/CoreInput.svelte';
    import type { ScannerWidget } from '$lib/forms/Widget';

    let cancelBtn = $state<HTMLButtonElement>();

    let html5QrCode: Html5Qrcode;

    onMount(() => {
        html5QrCode = new Html5Qrcode('reader');
    });

    interface Props {
        t: Translations;
        widget: ScannerWidget<C>;
        context: C;
        value: string;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onClick = async () => {
        if (widget.lock(context)) return;
        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length) html5QrCode
            .start(
                { facingMode: 'environment' },
                undefined,
                decodedText => {
                    const scannedText = widget.processScannedText(decodedText, context);
                    value = scannedText;
                    widget.onValueSet(context, scannedText);
                    cancelBtn?.click();
                },
                undefined,
            )
            .catch(e => {
                console.error(e);
                cancelBtn?.click();
            });
    };

    const cancel = () => {
        html5QrCode.stop();
    };
</script>

{#snippet trailingContent()}
    <Button text={t.widget.scanBarcode} color="secondary" outline disabled={widget.lock(context)}
            class="h-auto" modalID="cam" onclick={onClick} icon="barcode_reader" />
{/snippet}

<CoreInput
    bind:showError bind:value {context} setTextValue={text => text} {t} textValue={value} {widget}
    {trailingContent}
/>

<div class="modal hidden" id="cam">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{t.widget.scanCode}:</h4>
                <Button class="btn-close" dismissModal label={t.widget.cancel} onclick={cancel} />
            </div>

            <div class="modal-body flex justify-content-center">
                <div class="w-full" id="reader"></div>
            </div>

            <div class="modal-footer">
                <Button bind:element={cancelBtn} color="danger"
                        dismissModal onclick={cancel} text={t.widget.cancel} />
            </div>
        </div>
    </div>
</div>
