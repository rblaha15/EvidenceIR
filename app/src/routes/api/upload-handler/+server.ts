import { handleUpload } from '@vercel/blob/client';
import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
    return Response.json(await handleUpload({
        body: await request.json(),
        request,
        onBeforeGenerateToken: async () => ({
            addRandomSuffix: true,
        }),
        token: env.EMAIL_BLOB_READ_WRITE_TOKEN,
    }));
};