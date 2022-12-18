<script lang="ts">
	import type { Data, Pisatkova } from '$lib/Vec';
	import { Html5Qrcode } from 'html5-qrcode';
	import { onMount } from 'svelte';
	import Pisatko from './Pisatko.svelte';

	onMount(async () => {});

	export let onScan: (text: string) => void;

	let zrusitBtn: HTMLButtonElement;

	let html5QrCode: Html5Qrcode;

	onMount(() => {
		html5QrCode = new Html5Qrcode('reader');
	});

	export let vec: Pisatkova;
	export let zobrazit: boolean;

	const onClick = async () => {
		const devices = await Html5Qrcode.getCameras();

		if (devices && devices.length) {
			const cameraId = devices[0].id;
			html5QrCode
				.start(
					{ facingMode: 'environment' },
					undefined,
					(decodedText, _) => {
						onScan(decodedText);

						zrusitBtn.click();
					},
					undefined
				)
				.catch((e) => {
					console.error(e);

					zrusitBtn.click();
				});
		}
	};

	const zrusit = () => {
		html5QrCode.stop();
	};
</script>

<div class="d-sm-flex flex-sm-row align-items-end mb-2">
	<div class="flex-grow-1"><Pisatko bind:vec /></div>
	{#if zobrazit}
		<span class="m-2"> nebo </span>
		<div>
			<button
				type="button"
				class="btn btn-outline-secondary h-auto"
				data-bs-toggle="modal"
				data-bs-target="#cam"
				on:click={onClick}
			>
				Naskenujte čárový kód z TČ
			</button>
		</div>
	{/if}
</div>
<div class="modal" id="cam">
	<div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header ">
				<h4 class="modal-title">Naskenujte kód:</h4>
				<button
					type="button"
					class="btn-close"
					data-bs-dismiss="modal"
					on:click={zrusit}
					title="Zrušit"
				/>
			</div>

			<div class="modal-body d-flex justify-content-center">
				<div class="w-100" id="reader" />
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-outline-danger"
					bind:this={zrusitBtn}
					on:click={zrusit}
					data-bs-dismiss="modal">Zrušit</button
				>
			</div>
		</div>
	</div>
</div>
