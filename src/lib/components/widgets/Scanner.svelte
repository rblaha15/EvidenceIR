<script generics="D" lang="ts">
    import { ScannerWidget } from '$lib/forms/Widget.svelte.js';
    import { Html5Qrcode } from 'html5-qrcode';
    import { onMount } from 'svelte';
    import Input from '$lib/components/widgets/Input.svelte';
    import type { Translations } from '$lib/translations';
    import Button from '$lib/components/Button.svelte';

    let cancelBtn = $state<HTMLButtonElement>();

    let html5QrCode: Html5Qrcode;

    onMount(() => {
        html5QrCode = new Html5Qrcode('reader');
    });

    interface Props {
        data: D;
        t: Translations;
        widget: ScannerWidget<D>;
    }

    let {
        data, t,
        widget = $bindable(),
    }: Props = $props();

    const onClick = async () => {
        if (widget.lock(data)) return;
        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length) html5QrCode
            .start(
                { facingMode: 'environment' },
                undefined,
                decodedText => {
                    widget.setValue(data, widget.processScannedText(decodedText, data));
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

<div class={["d-flex flex-column flex-sm-row gap-1", widget.showError(data) ? 'align-items-sm-start' : 'align-items-sm-center']}>
    <div class="flex-grow-1"><Input bind:widget {data} {t} /></div>
    <div class="d-flex gap-1 align-items-sm-center flex-column flex-sm-row">
        <span class="text-center">{t.widget.or_Scan}</span>
        <Button text={t.widget.scanBarcode} color="secondary" disabled={widget.lock(data)}
                class="h-auto" modalID="cam" onclick={onClick} />
    </div>
</div>
<div class="modal" id="cam">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{t.widget.scanCode}:</h4>
                <Button label={t.widget.cancel} class="btn-close" dismissModal onclick={cancel} />
            </div>

            <div class="modal-body d-flex justify-content-center">
                <div class="w-100" id="reader"></div>
            </div>

            <div class="modal-footer">
                <Button text={t.widget.cancel} color="danger"
                        dismissModal onclick={cancel} bind:element={cancelBtn} />
            </div>
        </div>
    </div>
</div>
