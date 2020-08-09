
export async function GetWorkerResults(documentProcessingWorker: Worker, message: string) {
    documentProcessingWorker.postMessage(message)
    // Wait how does this come from the worker as an intact document?
    return await new Promise<string>(resolve => documentProcessingWorker.onmessage = (ev: MessageEvent) => resolve(ev.data));
}