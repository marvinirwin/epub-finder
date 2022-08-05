import vision from "@google-cloud/vision";

const doGoogleOcr = async (param: string | Buffer): Promise<string[]> => {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();
  // Performs text detection on the local file
  const [result] = await client.textDetection(param);
  return [result.fullTextAnnotation.text];
};
export default doGoogleOcr;