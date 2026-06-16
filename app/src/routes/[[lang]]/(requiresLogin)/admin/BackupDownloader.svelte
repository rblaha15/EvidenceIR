<script lang="ts">
    import JSZip from 'jszip';
    import { dayISO } from '$lib/helpers/date';
    import { createFileUrl, downloadFile } from '$lib/helpers/files';
    import { Button } from "$lib/components/ui/button";
    import { backup } from "$lib/client/db/mongo";

    const download = async () => {
        const { irs, nsps } = await backup();
        const zip = new JSZip();

        zip.file('backupIR.json', JSON.stringify(irs, undefined, 4));
        zip.file('backupSP.json', JSON.stringify(nsps, undefined, 4));

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadFile(await createFileUrl(blob), `${dayISO()}.zip`);
    };
</script>

<Button onclick={download}>Stáhnout</Button>