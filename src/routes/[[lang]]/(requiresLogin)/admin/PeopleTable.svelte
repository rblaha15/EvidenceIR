<script lang="ts">

    import type { Person } from '$lib/client/realtime';
    import { page } from '$app/state';

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
        colors = peopleWithColors.map(([, c]) => c);
    } else if (people) {
        colors = people.map(() => '');
    } else {
        throw 'No people';
    }

    const showCompanies = (companies: Record<string, string>) => companies.keys()
        .map(c => `<a href="#companies-${c}">${c}</a>`)
        .join(', ');
</script>

<div class="overflow-x-auto">
    <table class="table text-break table-striped table-hover text-nowrap">
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
            <tr class="table-{colors[i]}" id={person.email}
                style:scroll-margin-top={6 + (document.querySelector('nav')?.getBoundingClientRect()?.height ?? 0) + 'px'}
                class:table-info={page.url.hash.split("-")[1] === person.email}
            >
                <th>{person.email}</th>
                <td>{@html showCompanies(person.assemblyCompanies)}</td>
                <td>{@html showCompanies(person.commissioningCompanies)}</td>
                <td>{person.responsiblePerson}</td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>