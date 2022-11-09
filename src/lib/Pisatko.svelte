<script type="ts">
	export let nazev: string;
	export let text: string;
</script>

<label for={nazev}>{nazev}</label>
<input id={nazev} type="text" class="form-control" bind:value={text} />
