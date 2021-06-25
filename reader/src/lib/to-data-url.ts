import {resolveExtFromResponseHeaders} from "./resolve-ext-from-response-headers";

export const toDataUrl = (url: string) => fetch(url)
    .then(response => ({blob: response.blob(), ext: resolveExtFromResponseHeaders(response)}))
    .then(({
               blob,
               ext
           }) => new Promise<{ ext: string | undefined, dataUrl: string, blob: Promise<Blob> }>(async (resolve, reject) => {
        const reader = new FileReader()
        // TODO figure out if this will ever be an arrayBuffer
        reader.onloadend = () => resolve({dataUrl: reader.result as string, blob, ext})
        reader.onerror = reject
        reader.readAsDataURL(await blob);
    }))