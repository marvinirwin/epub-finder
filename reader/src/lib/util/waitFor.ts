export function waitFor<T>(f: () => T, n: number) {
    return new Promise<T>((resolve) => {
        const interval = setInterval(() => {
            const t2 = f();
            if (t2) {
                resolve(t2)
                clearInterval(interval)
            }
        }, n)
    })
}
