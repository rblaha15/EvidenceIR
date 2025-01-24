<script lang="ts">
    import type { Company } from '$lib/client/realtime';
    import { page } from '$app/state';

    interface Props {
        companies?: Company[],
        companiesWithColors?: [Company, string][],
    }

    let {
        companies,
        companiesWithColors,
    }: Props = $props();
    let colors = $state() as string[];
    if (companiesWithColors) {
        companies = companiesWithColors.map(([p]) => p);
        colors = companiesWithColors.map(([, c]) => c);
    } else if (companies) {
        colors = companies.map(() => '');
    } else {
        throw 'No companies';
    }
</script>

<table class="table text-break table-striped table-hover">
    <thead>
    <tr>
        <th>IČO</th>
        <th>Jméno</th>
        <th>Email</th>
        <th>Telefon</th>
        <th>Zástupce</th>
    </tr>
    </thead>
    <tbody>
    {#each companies as company, i}
        <tr class="table-{colors[i]}" id={company.crn}
            style:scroll-margin-top={6 + (document.querySelector('nav')?.getBoundingClientRect()?.height ?? 0) + 'px'}
            class:table-info={page.url.hash.split("-")[1] === company.crn}
        >
            <th>{company.crn}</th>
            <td>{company.companyName}</td>
            <td>{company.email}</td>
            <td>{company.phone}</td>
            <td>{company.representative}</td>
        </tr>
    {/each}
    </tbody>
</table>