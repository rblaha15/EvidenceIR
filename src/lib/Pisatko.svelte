<script type="js">
    export let nazev = ""
    export let text = ""
</script>

<label for="{nazev}">{nazev}</label>
<input id="{nazev}"type="text" class="form-control" bind:value={text}>