export const ccEdictRegex = /([\p{Script_Extensions=Han}\d]+) ([\p{Script_Extensions=Han}\d]+) (.*?)$/gmu;
export const parseCedictDictionary = (data: string): Map<string, string> => {
    const dictionary = new Map<string, string>();
    data
        .split("\n")
        .forEach((line: string) => {
            const [, traditional, simplified, definition] = ccEdictRegex.exec(line) || [];
            dictionary.set(traditional, definition);
            dictionary.set(simplified, definition);
        });
    return dictionary;
};
