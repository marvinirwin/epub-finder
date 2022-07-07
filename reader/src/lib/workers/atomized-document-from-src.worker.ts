/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument, AtomizeSrcDocParams} from 'languagetrainer-server/src/shared'
// @ts-ignore
import { XMLSerializer } from 'xmldom'

// @ts-ignore
self.window = self
// @ts-ignore
const ctx: Worker = self as any


// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const params = ev.data as AtomizeSrcDocParams
    const doc = AtomizedDocument.atomizeDocument(params)
    ctx.postMessage(doc.toString())
}
