export function printExecTime<T>(name: string, cb: () => T) {
    const t1 = performance.now();
    const ret = cb();
    const t2 = performance.now();
    console.log(`${name} took ${t2 - t1}`);
    return ret;
}
export async function printExecTimeAsync<T>(name: string, cb: () => T) {
    const t1 = performance.now();
    const ret = await cb();
    const t2 = performance.now();
    console.log(`${name} took ${t2 - t1}`);
    return ret;
}
