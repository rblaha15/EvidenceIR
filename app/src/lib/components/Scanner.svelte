<script lang="ts">
	import type { Pisatkova } from '$lib/Vec.svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import { onMount } from 'svelte';
	import Pisatko from './veci/Pisatko.svelte';
	import type { Translations } from '$lib/translations';
	import type { Data } from '$lib/Data';

	let zrusitBtn = $state<HTMLButtonElement>();

	let html5QrCode: Html5Qrcode;

	onMount(() => {
		html5QrCode = new Html5Qrcode('reader');
	});

	interface Props {
		data: Data;
		t: Translations;
		onScan: (text: string) => void;
		vec: Pisatkova<Data>;
	}

	let {
		data,
		t,
		onScan,
		vec = $bindable(),
	}: Props = $props();

	const onClick = async () => {
		const devices = await Html5Qrcode.getCameras();

		if (devices && devices.length) {
			html5QrCode
				.start(
					{ facingMode: 'environment' },
					undefined,
					(decodedText, _) => {
						onScan(decodedText);

						zrusitBtn?.click();
					},
					undefined
				)
				.catch((e) => {
					console.error(e);

					zrusitBtn?.click();
				});
		}
	};

	const zrusit = () => {
		html5QrCode.stop();
	};
</script>

<div class="d-sm-flex flex-sm-row align-items-end mb-2">
	<div class="flex-grow-1"><Pisatko bind:vec {t} {data} /></div>
	<span class="m-2"> {t.or} </span>
	<div>
		<button
			type="button"
			class="btn btn-outline-secondary h-auto"
			data-bs-toggle="modal"
			data-bs-target="#cam"
			onclick={onClick}
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
					type="button"
					class="btn-close"
					data-bs-dismiss="modal"
					onclick={zrusit}
					title={t.cancel}
					aria-label={t.cancel}
				></button>
			</div>

			<div class="modal-body d-flex justify-content-center">
				<div class="w-100" id="reader"></div>
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-outline-danger"
					bind:this={zrusitBtn}
					onclick={zrusit}
					data-bs-dismiss="modal">{t.cancel}</button
				>
			</div>
		</div>
	</div>
</div>
