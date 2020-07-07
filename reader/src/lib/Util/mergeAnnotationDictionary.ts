import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";

export function mergeWordTextNodeMap(cDict: Dictionary<IAnnotatedCharacter[]>, acc: Dictionary<IAnnotatedCharacter[]>) {
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
        for (let key in dict) {
            if (acc[key]) acc[key].push(...dict[key]);
            else acc[key] = dict[key]
        }
    }
    return acc;
}