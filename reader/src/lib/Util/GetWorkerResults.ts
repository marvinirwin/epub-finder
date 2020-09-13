
export async function GetWorkerResults<T>(worker: Worker, message: string): Promise<T> {
    worker.postMessage(message)
    // Wait how does this come from the worker as an intact document?
    const result = await new Promise<T>(resolve => worker.onmessage = (ev: MessageEvent) => resolve(ev.data));
    worker.terminate();
    return result as unknown as T;
}