export function printExecTime<T>(name: string, cb: () => T) {
    const t1 = performance.now();
    const t2 = performance.now();
    const ret = cb();
    console.log(`${name} took ${t2 - t1}`);
    return ret;
}