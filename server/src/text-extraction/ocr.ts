import vision from "@google-cloud/vision";

const doGoogleOcr = async (param: string | Buffer): Promise<string[]> => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient({
            credentials: {
                private_key: process.env.GOOGLE_CLIENT_PRIVATE_KEY,
                client_email: process.env.GOOGLE_CLIENT_EMAIL
            },
            projectId: process.env.GOOGLE_CLIENT_PROJECT_ID
        }
    );
    // Performs text detection on the local file
    const [result] = await client.textDetection(param);
    return [result.fullTextAnnotation.text];
};
export default doGoogleOcr;