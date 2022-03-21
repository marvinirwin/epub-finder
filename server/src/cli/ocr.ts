import vision from "@google-cloud/vision";


/**
 * @deprecated
 * @param param
 */
const doGoogleOcr = async(param: { fileName: string }): Promise<string[]> => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */

    // Performs text detection on the local file
    const [result] = await client.textDetection(param.fileName);
    return [result.fullTextAnnotation.text];
};

export default doGoogleOcr;