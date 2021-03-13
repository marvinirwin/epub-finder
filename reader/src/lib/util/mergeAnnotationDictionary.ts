import {Dictionary} from "lodash";
import {AtomMetadata} from "../../../../server/src/shared/atom-metadata.interface.ts/atom-metadata";

export function mergeWordTextNodeMap(cDict: Dictionary<AtomMetadata[]>, acc: Dictionary<AtomMetadata[]>) {
    Object.entries(cDict).forEach(([word, annotatedCharacters]) => {
        if (acc[word]) {
            acc[word].push(...annotatedCharacters);
        } else {
            acc[word] = annotatedCharacters;
        }
    })
    return acc;
}

export function mergeDictArrays<T>(...dicts: Dictionary<T[]>[]):Dictionary<T[]> {
    const acc: Dictionary<T[]> = {};
    for (let i = 0; i < dicts.length; i++) {
        const dict = dicts[i];
        for (const key in dict) {
            if (acc[key]) acc[key].push(...dict[key]);
            else acc[key] = dict[key]
        }
    }
    return acc;
}