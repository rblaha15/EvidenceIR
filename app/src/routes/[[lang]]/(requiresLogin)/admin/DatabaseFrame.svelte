<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/components/ui/button';
    import type { PageData } from './$types';

    const { dbLink } = page.data as PageData;
</script>

<Button href={dbLink} target="_blank">Otevřít na nové kartě</Button>

<iframe src={dbLink} title="Databáze" height="10000"></iframe>