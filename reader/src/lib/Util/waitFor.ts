export function waitFor(f: () => any, n: number) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (f()) {
                resolve();
                clearInterval(interval);
            }
        }, n);
    })

}