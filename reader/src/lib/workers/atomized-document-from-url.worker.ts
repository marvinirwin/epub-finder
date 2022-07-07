/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import { AtomizedDocument } from 'languagetrainer-server/src/shared'
import { WorkerError } from './worker.helpers'
import {AtomizedDocumentFromUrlParams} from "languagetrainer-server/src/shared";

// @ts-ignore
self.window = self
// @ts-ignore
const ctx: Worker = self as any


ctx.onmessage = async (ev) => {
    try {
        const params = ev.data as AtomizedDocumentFromUrlParams
        const response = await fetch(params.url)
        const documentSrc = new TextDecoder().decode(await response.arrayBuffer())
        const doc = AtomizedDocument.atomizeDocument({
            documentSrc,
            documentId: params.documentId
        })
        ctx.postMessage(doc.toString())
    } catch (e) {
        ctx.postMessage({
            type: 'error',
            // @ts-ignore
            errorMessage: `Could not find ${e.toString()}`,
        } as WorkerError)
    }
}
