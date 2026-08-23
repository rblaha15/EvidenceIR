<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/components/ui/button';
    import type { PageData } from './$types';

    const { dbLink } = page.data as PageData;

    const dbPath = $derived(page.url.hash.startsWith('#db-') ? page.url.hash.slice(4) : 'app');

    const path = $derived(`${dbLink}db/${decodeURI(dbPath)}`);

    import type { Attachment } from 'svelte/attachments';

    const better: Attachment<HTMLIFrameElement> = element => {
        if (!dbPath.includes('?query')) return;
        const document = element.contentDocument;
        if (!document) return;
        document.onload = () => {
            document.querySelector('#tabs')?.remove();
            document.querySelector('#my-tab-content')?.remove();
            document.querySelectorAll('table:first-child tr > *:first-child').forEach(e => e.remove());
            document.querySelectorAll('h2').forEach(e => e.remove());
            document.querySelector('.row:last-child')?.remove();
            document.querySelector('.row:last-child')?.remove();
            document.querySelector('.btn-danger')?.remove();
        };
    };
</script>

<Button href={path} target="_blank">Otevřít na nové kartě</Button>

<iframe src={path} title="Databáze" height="10000" {@attach better}></iframe>