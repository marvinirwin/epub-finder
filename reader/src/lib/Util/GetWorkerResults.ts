
export async function GetWorkerResults(worker: Worker, message: string): Promise<string> {
    worker.postMessage(message)
    // Wait how does this come from the worker as an intact document?
    const result = await new Promise<string>(resolve => worker.onmessage = (ev: MessageEvent) => resolve(ev.data));
    worker.terminate();
    return result;
}