<script lang="ts">
    import { call } from '$lib/client/endpoints';
    import JSZip from 'jszip';
    import { dayISO } from '$lib/helpers/date';
    import { createFileUrl, downloadFile } from '$lib/helpers/files';
    import { Button } from "$lib/components/ui/button";

    const download = async () => {
        const { irs, nsps, rks, sns } = await call('db/admin/backup');
        const zip = new JSZip();

        zip.file('backupIR.json', JSON.stringify(irs, undefined, 4));
        zip.file('backupSP.json', JSON.stringify(nsps, undefined, 4));
        zip.file('backupRK.json', JSON.stringify(rks, undefined, 4));
        zip.file('backupSN.json', JSON.stringify(sns, undefined, 4));
        zip.file('info.json', JSON.stringify({
            SEIRVersion: 2,
        }, undefined, 4));

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadFile(await createFileUrl(blob), `${dayISO()}.zip`);
    };
</script>

<Button onclick={download}>Stáhnout</Button>