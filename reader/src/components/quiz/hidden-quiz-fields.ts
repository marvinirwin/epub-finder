import {QuizCardFields} from "./quiz-card-fields.interface";

export type HiddenQuizFields = Set<keyof QuizCardFields>;
export const hiddenDefinition: HiddenQuizFields = new Set([
    'definition',
    'description',
]);
export const hiddenCharacter: HiddenQuizFields = new Set([
    'learningLanguage'
]);