<script type="ts">
	export let nazev: string;
	export let text: string;
	export let nutne: boolean;
	export let onError: string;
	export let regex: RegExp;
</script>

<label for={nazev}>{nazev}</label>
<input id={nazev} type="text" class="form-control" bind:value={text} />

{#if (text == '' && nutne) || !regex.test(text)}
	<p class="text-danger">{onError}</p>
{/if}
