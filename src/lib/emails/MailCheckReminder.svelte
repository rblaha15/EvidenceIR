<script lang="ts">
    import type { RecommendationData } from '$lib/data';
    const {
        link, data,
    }: {
        link: string,
        data: RecommendationData,
    } = $props();
</script>

<p>Dobrý den,<br />blíží se termín pro provedení roční kontroly Vašeho tepelného čerpadla.</p>

<p>Jméno: {data.user}</p>
<p>Místo instalace: {data.location}</p>
<p>Kontrolu provede: {data.company}</p>

<p>Pokud chcete prohlídku objednat, klikněte na tlačítko.</p>

<p><a href="{link}" style="
    display: inline-block;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #fff;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    border: 1px solid #198754;
    border-radius: 0.375rem;
    background-color: #198754;
">Objednat roční kontrolu</a></p>