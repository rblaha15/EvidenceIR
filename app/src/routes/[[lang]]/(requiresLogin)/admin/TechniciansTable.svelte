<script lang="ts">
    import type { Technician } from '$lib/client/realtime';

    interface Props {
        technicians?: Technician[],
        techniciansWithColors?: [Technician, string][],
    }

    let {
        technicians,
        techniciansWithColors,
    }: Props = $props();
    let colors = $state() as string[];
    if (techniciansWithColors) {
        technicians = techniciansWithColors.map(([p]) => p);
        colors = techniciansWithColors.map(([, c]) => c);
    } else if (technicians) {
        colors = technicians.map(() => '');
    } else {
        throw 'No technicians';
    }
</script>

<table class="table text-break table-striped table-hover">
    <thead>
    <tr>
        <th>Jméno</th>
        <th>Email</th>
        <th>Telefonní číslo</th>
        <th>Iniciály do SP</th>
    </tr>
    </thead>
    <tbody>
    {#each technicians as technician, i}
        <tr class="table-{colors[i]}">
            <th>{technician.name}</th>
            <td>{technician.email}</td>
            <td>{technician.phone}</td>
            <td>{technician.initials}</td>
        </tr>
    {/each}
    </tbody>
</table>