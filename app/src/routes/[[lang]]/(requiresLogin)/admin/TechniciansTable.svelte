<script lang="ts">
    import type { Technician } from '$lib/client/realtime';
    import { page } from '$app/stores';

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
        colors = techniciansWithColors.map(([_, c]) => c);
    } else if (technicians) {
        colors = technicians.map(_ => '');
    } else {
        throw 'No technicians';
    }
</script>

<table class="table text-break table-striped table-hover">
    <thead>
    <tr>
        <th>Jméno</th>
        <th>Email</th>
        <th>Iniciály do SP</th>
    </tr>
    </thead>
    <tbody>
    {#each technicians as technician, i}
        <tr class="table-{colors[i]}">
            <th>{technician.name}</th>
            <td>{technician.email}</td>
            <td>{technician.initials}</td>
        </tr>
    {/each}
    </tbody>
</table>