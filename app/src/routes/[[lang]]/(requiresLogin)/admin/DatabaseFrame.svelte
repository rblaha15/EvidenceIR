<script lang="ts">
    import { page } from '$app/state';
    import type { PageData } from './$types';

    const { dbLink } = page.data as PageData;
</script>

<iframe src={dbLink} title="Databáze"></iframe>