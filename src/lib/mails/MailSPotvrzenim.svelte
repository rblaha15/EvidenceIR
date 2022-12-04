<script lang="ts">
	export let ano: string;
	export let ne: string;
	export let fakturuje: boolean;
</script>

<p>
	Na základě vašeho požadavku na zřízení vzdálené správy regulátoru Vašeho topného systému Vám
	zasíláme souhlas:
</p>

<p>
	Souhlasím se vzdálenou správou uvedeného regulátoru IR prostřednictvím internetové služby
	RegulusRoute.
</p>
{#if fakturuje}
	<p>Souhlasím s jednorázovou cenou 500 Kč bez DPH za tuto službu.</p>
{/if}
<p>Přístup poskytne společnost REGULUS spol. s r.o. i servisní firmě.</p>
<p>
	Více informací o zpracovaní Vašich osobních údajů najdete v příloze tohoto emailu, která je
	součástí tohoto souhlasu.
</p>

<p><a href={ano}>Souhlasím</a></p>
<p><a href={ne}>Nesouhlasím</a></p>
