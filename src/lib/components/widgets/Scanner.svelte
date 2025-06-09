<script generics="D" lang="ts">
    import { ScannerWidget } from '$lib/Widget.svelte.js';
    import { Html5Qrcode } from 'html5-qrcode';
    import { onMount } from 'svelte';
    import Input from '$lib/components/widgets/Input.svelte';
    import type { Translations } from '$lib/translations';

    let zrusitBtn = $state<HTMLButtonElement>();

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
        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length) html5QrCode
            .start(
                { facingMode: 'environment' },
                undefined,
                decodedText => {
                    widget.setValue(data, widget.processScannedText(decodedText, data));
                    zrusitBtn?.click();
                },
                undefined,
            )
            .catch(e => {
                console.error(e);
                zrusitBtn?.click();
            });
    };

    const zrusit = () => {
        html5QrCode.stop();
    };
</script>

<div class={["d-flex flex-column flex-sm-row gap-1", widget.showError(data) ? 'align-items-sm-start' : 'align-items-sm-center']}>
    <div class="flex-grow-1"><Input bind:widget {data} {t} /></div>
    <div class="d-flex gap-1 align-items-sm-center flex-column flex-sm-row">
        <span class="text-center">{t.or}</span>
        <button
            class="btn btn-secondary h-auto"
            data-bs-target="#cam"
            data-bs-toggle="modal"
            onclick={onClick}
            type="button"
        >
            {t.scanBarcode}
        </button>
    </div>
</div>
<div class="modal" id="cam">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{t.scanCode}:</h4>
                <button
                    aria-label={t.cancel}
                    class="btn-close"
                    data-bs-dismiss="modal"
                    onclick={zrusit}
                    title={t.cancel}
                    type="button"
                ></button>
            </div>

            <div class="modal-body d-flex justify-content-center">
                <div class="w-100" id="reader"></div>
            </div>

            <div class="modal-footer">
                <button
                    bind:this={zrusitBtn}
                    class="btn btn-danger"
                    data-bs-dismiss="modal"
                    onclick={zrusit}
                    type="button">{t.cancel}</button
                >
            </div>
        </div>
    </div>
</div>
