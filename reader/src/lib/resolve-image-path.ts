import JSZip from "jszip";
import {toDataUrl} from "./to-data-url";

export async function resolveImagePath({
                                           photo,
                                           zip,
                                           learning_language
                                       }: { photo: string | undefined, zip: JSZip, learning_language: string }) {
    if (!photo) {
        return "";
    }
    // I can get the extension from the response headers
    // But then I can't use toDataUrl
    const {ext, /*dataUrl,*/ blob} = await toDataUrl(photo);
    const photoAnkiPath = `${learning_language}.${ext}`
    await zip.file(photoAnkiPath, await blob);
    return `<img src=\\"${photoAnkiPath}\\"/>`
}