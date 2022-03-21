import {google} from "@google-cloud/vision/build/protos/protos";
import vision from "@google-cloud/vision";

export const getImageText = async (buffer: Buffer) => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    const recognized_text: string[] = [];
    // Performs text detection on the local file
    const [result] = await client.textDetection(buffer);
    const detections = result.textAnnotations;
    if (detections) {
        detections.forEach((text: google.cloud.vision.v1.IEntityAnnotation) => recognized_text.push(text.description));
    }
    return recognized_text;
};