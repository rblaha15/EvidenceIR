<script lang="ts">
    import { page } from '$app/state';
    import type { loadAdmin } from '$lib/features/admin/load';
    import Table from '$lib/features/admin/Table.svelte';

    const { userActivity } = page.data as Awaited<ReturnType<typeof loadAdmin>>;

    const id = $props.id();
</script>

<Table {id} items={userActivity} options={{
    key: 'email',
    columns: {
        email: { header: 'Email' },
        name: { header: 'Jméno', cellType: 'header' },
        createdAt: { header: 'Účet vytvořen', type: 'datetime' },
        lastSeenAt: { header: 'Naposedy viděn', type: 'datetime', optional: true },
    },
}} />