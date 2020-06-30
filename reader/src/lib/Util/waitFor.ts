export function waitFor(f: () => any, n: number) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            let f1 = f();
            if (f1) {
                resolve();
                clearInterval(interval);
            }
        }, n);
    })

}