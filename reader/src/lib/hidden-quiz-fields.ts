import {QuizCardFields} from "../components/quiz/quiz-card-fields.interface";

export type HiddenQuizFields = Set<keyof QuizCardFields>;
export const hiddenDefinition: HiddenQuizFields = new Set([
    'definition',
    'description',
    'romanization'
]);
export const hiddenLearningLanguage: HiddenQuizFields = new Set([
    'learningLanguage',
    'romanization'
]);