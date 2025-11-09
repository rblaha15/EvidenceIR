<script lang="ts">

    import { getToken } from '$lib/client/auth';
    import type { IR } from '$lib/data';
    import type { Raw } from '$lib/forms/Form';
    import type { DataNSP } from '$lib/forms/NSP/formNSP';
    import JSZip from 'jszip';
    import { createFileUrl, downloadFile } from '../../helpers';
    import { dayISO } from '$lib/helpers/date';

    const download = async () => {
        const token = await getToken();
        const response = await fetch(`/api/backup?token=${token}`);
        const data = await response.json() as { ir: IR[], nsp: Raw<DataNSP>[] };
        const zip = new JSZip();

        zip.file('backupIR.json', JSON.stringify(data.ir, undefined, 4));
        zip.file('backupSP.json', JSON.stringify(data.nsp, undefined, 4));

        await zip.generateAsync({ type: 'blob' }).then(async blob => {
            downloadFile(await createFileUrl(blob), `${dayISO()}.zip`);
        });
    };
</script>

<button class="btn btn-primary" onclick={download}>
    Stáhnout
</button>