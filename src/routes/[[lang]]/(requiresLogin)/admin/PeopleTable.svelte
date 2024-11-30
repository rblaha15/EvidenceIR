<script lang="ts">

    import type { Person } from '$lib/client/realtime';

    interface Props {
        people?: Person[],
        peopleWithColors?: [Person, string][],
    }

    let {
        people,
        peopleWithColors,
    }: Props = $props();
    let colors = $state() as string[];
    if (peopleWithColors) {
        people = peopleWithColors.map(([p]) => p);
        colors = peopleWithColors.map(([_, c]) => c);
    } else if (people) {
        colors = people.map(_ => '');
    } else {
        throw 'No people';
    }

    const showCompanies = (companies: Record<string, string>) => Object.keys(companies)
        .map(c => `<a href="#companies-${c}">${c}</a>`)
        .join(', ');
</script>

<table class="table text-break table-striped table-hover">
    <thead>
    <tr>
        <th>Email</th>
        <th>Montážní firmy</th>
        <th>Uvaděči</th>
        <th>Zodpovědná osoba</th>
    </tr>
    </thead>
    <tbody>
    {#each people as person, i}
        <tr class="table-{colors[i]}">
            <th>{person.email}</th>
            <td>{@html showCompanies(person.assemblyCompanies)}</td>
            <td>{@html showCompanies(person.commissioningCompanies)}</td>
            <td>{person.responsiblePerson}</td>
        </tr>
    {/each}
    </tbody>
</table>