<script lang="ts">
    import { page } from '$app/state';
    import type { loadAdmin } from '$lib/features/admin/load';
    import Table from '$lib/features/admin/Table.svelte';
    import { datetimeFromISO } from '$lib/helpers/date';

    const { userActivity } = page.data as Awaited<ReturnType<typeof loadAdmin>>;

    const id = $props.id();
</script>

<Table {id} items={userActivity} options={{
    key: user => user.email,
    columns: {
        email: { header: 'Email' },
        name: { header: 'Jméno', cellType: 'header' },
        createdAt: { header: 'Účet vytvořen', transformValue: d => new Date(d).toLocaleString('cs') },
        lastSeenAt: { header: 'Naposedy viděn', transformValue: d => d ? new Date(d).toLocaleString('cs') : '—' },
    },
}} />