export const lastN = (n: number) => <T>(arr: T[]): T[] =>
  arr.slice(Math.max(arr.length - n, 1));
export const last5 = lastN(5);
