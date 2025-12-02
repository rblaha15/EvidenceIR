import { handleUpload } from '@vercel/blob/client';
import { EMAIL_BLOB_READ_WRITE_TOKEN } from "$env/static/private";

export const POST = async ({ request }) => {
    return Response.json(await handleUpload({
        body: await request.json(),
        request,
        onBeforeGenerateToken: async () => ({
            addRandomSuffix: true,
        }),
        token: EMAIL_BLOB_READ_WRITE_TOKEN,
    }));
};