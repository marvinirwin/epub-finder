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
    const {ext, /*dataUrl,*/ blob} = await toDataUrl(photo);
    const photoAnkiPath = `${learning_language}.${ext}`
    await zip.file(photoAnkiPath, await blob);
    return `<img src="${photoAnkiPath}"/>`
}