<script lang="ts">
    import JSZip from 'jszip';
    import { dayISO } from '$lib/helpers/date';
    import { createFileUrl, downloadFile } from '$lib/helpers/files';
    import { adminDatabase } from '$lib/client/firestore';

    const download = async () => {
        const ir = await adminDatabase.getAllIRs();
        const nsp = await adminDatabase.getAllNSPs();
        const zip = new JSZip();

        zip.file('backupIR.json', JSON.stringify(ir, undefined, 4));
        zip.file('backupSP.json', JSON.stringify(nsp, undefined, 4));

        await zip.generateAsync({ type: 'blob' }).then(async blob => {
            downloadFile(await createFileUrl(blob), `${dayISO()}.zip`);
        });
    };
</script>

<button class="btn btn-primary" onclick={download}>
    Stáhnout
</button>