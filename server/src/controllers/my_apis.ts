import fs from "fs";


export function memoInJson(filename: string, f: (...a: any[]) => any) {
    const memoFilePath = `${filename}.json`;
    const filedata = fs.existsSync(memoFilePath) && fs.readFileSync(memoFilePath).toString();
    const memo: { [key: string]: any } = JSON.parse(filedata || "{}");
    return async function (...args: any[]) {
        const key = JSON.stringify(args);
        if (!memo[key]) {
            memo[key] = await f(...args);
            await new Promise(resolve => fs.writeFile(memoFilePath, JSON.stringify(memo), resolve));
        }
        return memo[key];
    };
}


