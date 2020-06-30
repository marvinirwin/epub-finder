import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";

export function mergeAnnotationDictionary(cDict: Dictionary<IAnnotatedCharacter[]>, acc: Dictionary<IAnnotatedCharacter[]>) {
    Object.entries(cDict).forEach(([word, annotatedCharacters]) => {
        if (acc[word]) {
            acc[word].push(...annotatedCharacters);
        } else {
            acc[word] = annotatedCharacters;
        }
    })
}