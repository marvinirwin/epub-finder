export const lastN = (n: number) =>
    <T>(arr: Array<T>): Array<T> =>
        arr.slice(Math.max(arr.length - n, 1));
export const last5 = lastN(5);
