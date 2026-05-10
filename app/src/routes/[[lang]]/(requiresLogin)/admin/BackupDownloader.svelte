<script lang="ts">
    import JSZip from 'jszip';
    import { dayISO } from '$lib/helpers/date';
    import { createFileUrl, downloadFile } from '$lib/helpers/files';
    import { adminDatabase } from '$lib/client/firestore';
    import { Button } from "$lib/components/ui/button";

    const download = async () => {
        const ir = await adminDatabase.getAllIRs();
        const nsp = await adminDatabase.getAllNSPs();
        const zip = new JSZip();

        zip.file('backupIR.json', JSON.stringify(ir, undefined, 4));
        zip.file('backupSP.json', JSON.stringify(nsp, undefined, 4));

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadFile(await createFileUrl(blob), `${dayISO()}.zip`);
    };
</script>

<Button onclick={download}>Stáhnout</Button>